# API Contract Deploy-URL Runbook

This runbook covers the PR #21 API contract tests for the public StreakBeacon
streak API. Run them only against a deployed Vercel URL supplied by issue
metadata key `deploy_url` or by a release handoff.

## Scope

| Contract source | Automation |
| --- | --- |
| `docs/openapi.yaml` | `tests/api/streaks-contract.spec.ts` |
| `features/api/get-streaks.feature` | GET `/api/streaks` contract checks |
| `features/api/post-streaks.feature` | POST `/api/streaks` contract checks |
| `features/api/delete-streak.feature` | DELETE `/api/streaks/{id}` contract checks |

## Required Input

| Input | Required for API contract tests | Source |
| --- | --- | --- |
| `STREAKBEACON_BASE_URL` | Yes | Issue metadata key `deploy_url` or release handoff |
| `STREAKBEACON_TEST_EMAIL` | No | Smoke tests only |
| `STREAKBEACON_TEST_PASSWORD` | No | Smoke tests only |

Do not use localhost. Do not import or inspect files from `streakbeacon-app`.

## Install

```bash
npm install
npm run install:browsers
```

On hosts where `npm run install:browsers` cannot install system packages, run
`npx playwright install` and install missing OS packages out-of-band before
executing the tests.

## API Contract Command

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> \
npx playwright test tests/api/streaks-contract.spec.ts
```

Expected pass behavior with a valid deployed URL:

- Chromium runs three API contract tests.
- GET `/api/streaks` creates two unique streaks, verifies the list response
  against `docs/openapi.yaml`, and attempts cleanup.
- POST `/api/streaks` verifies create, missing-name `400`, and duplicate-name
  `409` responses against `docs/openapi.yaml`.
- DELETE `/api/streaks/{id}` verifies delete `204`, list removal, and
  missing-id `404` responses against `docs/openapi.yaml`.

## Skip Behavior

With no deployed URL:

```bash
npx playwright test tests/api/streaks-contract.spec.ts
```

Expected result: all three API contract tests are skipped with:

```text
Missing required black-box API test input: STREAKBEACON_BASE_URL
```

With a deployed URL but no smoke credentials:

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> \
npx playwright test tests/api/streaks-contract.spec.ts
```

Expected result: API contract tests still run. `STREAKBEACON_TEST_EMAIL` and
`STREAKBEACON_TEST_PASSWORD` are not required by `tests/api/streaks-contract.spec.ts`.

For comparison, the smoke command still requires all three values:

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> \
STREAKBEACON_TEST_EMAIL=<seeded-email> \
STREAKBEACON_TEST_PASSWORD=<seeded-password> \
npm run test:smoke
```

If any smoke input is absent, `tests/smoke/login-mark-today.spec.ts` is skipped
with a message listing the missing environment variable names.

## Result Comment Checklist

When reporting a deploy-URL run, include:

- the deployed Vercel URL tested and how it was supplied;
- the tests repo branch and commit;
- the exact command;
- pass, fail, or skip counts;
- any response mismatch, including endpoint, expected status/schema, and actual
  observed behavior.
