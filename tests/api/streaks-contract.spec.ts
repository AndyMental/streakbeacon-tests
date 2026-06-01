import { expect, test, type APIRequestContext } from '@playwright/test';
import { expectResponseMatchesOpenApi } from '../support/openapi-contract';

const requiredEnv = ['STREAKBEACON_BASE_URL'] as const;
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

type Streak = {
  id: string;
  name: string;
};

type ErrorResponse = {
  error: string;
};

function uniqueStreakName(prefix: string): string {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2)}`;
}

async function createStreak(request: APIRequestContext, name: string): Promise<Streak> {
  const response = await request.post('/api/streaks', { data: { name } });
  const body = await expectResponseMatchesOpenApi(response, 'post', '/api/streaks', 201);

  expect(body).toMatchObject({ name });

  return body as Streak;
}

test.describe('StreakBeacon API contract', () => {
  test.skip(missingEnv.length > 0, `Missing required black-box API test input: ${missingEnv.join(', ')}`);

  test('GET /api/streaks returns streaks matching docs/openapi.yaml', async ({ request }) => {
    const firstName = uniqueStreakName('Read');
    const secondName = uniqueStreakName('Exercise');
    const createdStreaks = [await createStreak(request, firstName), await createStreak(request, secondName)];

    const response = await request.get('/api/streaks');
    const body = await expectResponseMatchesOpenApi(response, 'get', '/api/streaks', 200);
    const names = (body as Streak[]).map((streak) => streak.name);

    expect(names).toEqual(expect.arrayContaining([firstName, secondName]));

    await Promise.all(
      createdStreaks.map((streak) =>
        request.delete(`/api/streaks/${encodeURIComponent(streak.id)}`).catch(() => undefined)
      )
    );
  });

  test('POST /api/streaks creates a streak and validates error responses against docs/openapi.yaml', async ({
    request
  }) => {
    const name = uniqueStreakName('Read');
    const createdStreak = await createStreak(request, name);

    const missingNameResponse = await request.post('/api/streaks', { data: {} });
    const missingNameBody = await expectResponseMatchesOpenApi(missingNameResponse, 'post', '/api/streaks', 400);

    expect((missingNameBody as ErrorResponse).error).toMatch(/name/i);

    const duplicateResponse = await request.post('/api/streaks', { data: { name } });
    const duplicateBody = await expectResponseMatchesOpenApi(duplicateResponse, 'post', '/api/streaks', 409);

    expect((duplicateBody as ErrorResponse).error).toMatch(/exists|duplicate|already/i);

    await request.delete(`/api/streaks/${encodeURIComponent(createdStreak.id)}`).catch(() => undefined);
  });

  test('DELETE /api/streaks/{id} deletes streaks and validates missing ids against docs/openapi.yaml', async ({
    request
  }) => {
    const name = uniqueStreakName('Delete');
    const createdStreak = await createStreak(request, name);

    const deleteResponse = await request.delete(`/api/streaks/${encodeURIComponent(createdStreak.id)}`);
    await expectResponseMatchesOpenApi(deleteResponse, 'delete', '/api/streaks/{id}', 204);

    const listResponse = await request.get('/api/streaks');
    const listBody = await expectResponseMatchesOpenApi(listResponse, 'get', '/api/streaks', 200);
    const names = (listBody as Streak[]).map((streak) => streak.name);

    expect(names).not.toContain(name);

    const missingId = `missing-streak-id-${Date.now()}`;
    const missingResponse = await request.delete(`/api/streaks/${missingId}`);
    const missingBody = await expectResponseMatchesOpenApi(missingResponse, 'delete', '/api/streaks/{id}', 404);

    expect((missingBody as ErrorResponse).error).toMatch(/not found|missing/i);
  });
});
