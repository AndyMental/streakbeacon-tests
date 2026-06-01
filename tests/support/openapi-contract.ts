import { expect, type APIResponse } from '@playwright/test';
import Ajv, { type ErrorObject, type Schema } from 'ajv';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

type HttpMethod = 'get' | 'post' | 'delete';

type JsonValue = boolean | null | number | string | JsonObject | JsonValue[];

type JsonObject = {
  [key: string]: JsonValue;
};

type OpenApiDocument = {
  components?: {
    schemas?: Record<string, JsonObject>;
  };
  paths: Record<
    string,
    Partial<
      Record<
        HttpMethod,
        {
          responses: Record<
            string,
            {
              content?: Record<
                string,
                {
                  schema?: JsonObject;
                }
              >;
            }
          >;
        }
      >
    >
  >;
};

const contractPath = path.resolve(process.cwd(), 'docs/openapi.yaml');
const contract = YAML.parse(fs.readFileSync(contractPath, 'utf8')) as OpenApiDocument;
const ajv = new Ajv({ allErrors: true, strict: false });

function resolveLocalRef(ref: string): JsonObject {
  const segments = ref
    .replace(/^#\//, '')
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'));

  let current: unknown = contract;

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
      throw new Error(`OpenAPI reference ${ref} could not be resolved at ${segment}.`);
    }

    current = (current as Record<string, unknown>)[segment];
  }

  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    throw new Error(`OpenAPI reference ${ref} does not resolve to an object schema.`);
  }

  return current;
}

function dereferenceSchema(schema: JsonObject): JsonObject {
  if (typeof schema.$ref === 'string') {
    return dereferenceSchema(resolveLocalRef(schema.$ref));
  }

  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => [
      key,
      value && typeof value === 'object' && !Array.isArray(value)
        ? dereferenceSchema(value)
        : Array.isArray(value)
          ? value.map((item) =>
              item && typeof item === 'object' && !Array.isArray(item) ? dereferenceSchema(item) : item
            )
          : value
    ])
  );
}

function getResponseSchema(method: HttpMethod, route: string, status: number): JsonObject | undefined {
  const operation = contract.paths[route]?.[method];

  if (!operation) {
    throw new Error(`OpenAPI contract does not define ${method.toUpperCase()} ${route}.`);
  }

  const response = operation.responses[String(status)];

  if (!response) {
    throw new Error(`OpenAPI contract does not define ${status} for ${method.toUpperCase()} ${route}.`);
  }

  const schema = response.content?.['application/json']?.schema;

  return schema ? dereferenceSchema(schema) : undefined;
}

function formatValidationErrors(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`).join('; ');
}

export async function expectResponseMatchesOpenApi(
  response: APIResponse,
  method: HttpMethod,
  route: string,
  expectedStatus: number
): Promise<JsonValue | undefined> {
  expect(response.status(), `${method.toUpperCase()} ${route} status`).toBe(expectedStatus);

  const schema = getResponseSchema(method, route, expectedStatus);

  if (!schema) {
    const body = await response.body();

    expect(body, `${method.toUpperCase()} ${route} ${expectedStatus} response body`).toHaveLength(0);
    return undefined;
  }

  const body = (await response.json()) as JsonValue;
  const validate = ajv.compile(schema as Schema);
  const valid = validate(body);

  expect(valid, formatValidationErrors(validate.errors)).toBeTruthy();

  return body;
}
