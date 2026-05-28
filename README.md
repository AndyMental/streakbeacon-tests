# streakbeacon-tests

Black-box Playwright tests for the deployed StreakBeacon site.

These tests must be run against a deployed Vercel URL. They do not run
against `localhost` and must not import StreakBeacon application source.
See `AGENTS.md` for the full agent guide.

## Setup

```bash
npm install
npm run install:browsers
```

`npm run install:browsers` downloads Chromium. On a fresh Linux runner you
may also need the OS-level Playwright dependencies:

```bash
npx playwright install --with-deps chromium
```

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `STREAKBEACON_BASE_URL` | Deployed Vercel URL under test, e.g. `https://streakbeacon.vercel.app`. |
| `STREAKBEACON_TEST_EMAIL` | Seeded test account email (only needed for the login smoke). |
| `STREAKBEACON_TEST_PASSWORD` | Seeded test account password (only needed for the login smoke). |

Tests that require a variable will skip with a clear message when it is
unset, rather than failing in a misleading way.

## Running tests

Run all tests against the deploy URL:

```bash
STREAKBEACON_BASE_URL=https://<your-deploy-url> npm test
```

Run only the placeholder smoke (title check at `/`):

```bash
STREAKBEACON_BASE_URL=https://<your-deploy-url> \
  npx playwright test tests/smoke/placeholder.spec.ts
```

Run the seeded login + mark-today smoke:

```bash
STREAKBEACON_BASE_URL=https://<your-deploy-url> \
STREAKBEACON_TEST_EMAIL=<seeded-email> \
STREAKBEACON_TEST_PASSWORD=<seeded-password> \
  npm run test:smoke
```

## Reports

HTML report is written to `playwright-report/`; traces, screenshots, and
videos for failed runs are written to `test-results/`.
