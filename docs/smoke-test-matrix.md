# StreakBeacon Deployed-URL Smoke Matrix

This matrix defines the black-box smoke coverage that can run once a stable
StreakBeacon Vercel deployment is supplied. Tests must use only the public
deployed site and seeded credentials; do not import or inspect app source.

## Required Inputs

| Input | Source | Required for | Notes |
| --- | --- | --- | --- |
| `STREAKBEACON_BASE_URL` | Issue metadata key `deploy_url` or release handoff | Every Playwright run | Must be a deployed Vercel URL, not localhost. |
| `STREAKBEACON_TEST_EMAIL` | Approved seeded test account secret | Authenticated smoke flows | Do not commit the value. |
| `STREAKBEACON_TEST_PASSWORD` | Approved seeded test account secret | Authenticated smoke flows | Do not commit the value. |

## Command

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> \
STREAKBEACON_TEST_EMAIL=<seeded-email> \
STREAKBEACON_TEST_PASSWORD=<seeded-password> \
npm run test:smoke
```

## Expected Artifacts

| Artifact | Location | When produced | Expected result |
| --- | --- | --- | --- |
| List reporter output | Terminal | Every run | Chromium project reports smoke scenario pass/fail/skip. |
| HTML report | `playwright-report/` | Every run | Openable Playwright report with the executed smoke result. |
| Trace | `test-results/` | First retry only | Available for retry diagnostics if the smoke test flakes or fails in CI. |
| Screenshot | `test-results/` | Failure only | Captures the failed page state. |
| Video | `test-results/` | Failure only | Captures the failed browser session. |

## Smoke Coverage

| Scenario | Gherkin source | Automation | URL/env prerequisite | Command | Pass condition | Blocked until deploy URL |
| --- | --- | --- | --- | --- | --- | --- |
| Seeded user marks today's streak day from the deployed site | `features/login-mark-today.feature` | `tests/smoke/login-mark-today.spec.ts` | `STREAKBEACON_BASE_URL`, `STREAKBEACON_TEST_EMAIL`, `STREAKBEACON_TEST_PASSWORD` | `npm run test:smoke` | The seeded user signs in, marks today if needed, and the today control is visibly marked. | Real deployed-site execution, credential validation, failure artifacts, and browser result are blocked until `deploy_url` is supplied. |
| User adds a first habit and sees it in the list with a zero streak | `features/create-habit.feature` | Pending | `STREAKBEACON_BASE_URL` and a deterministic clean or resettable account state | Pending automation after Gherkin validation and seeded-state strategy | The created habit appears in the visible list with streak count `0`. | Selector discovery, state setup/reset, and browser verification are blocked until a deployed URL and approved test-state strategy are supplied. |
| Habit with 7 contiguous marked days shows a filled recent-history row | `features/dashboard-streak-grid-render.feature` | Pending | `STREAKBEACON_BASE_URL` and seeded account containing a habit named `Read` with 7 contiguous marked days ending today | Pending automation after seeded data is available | Dashboard shows 7 filled recent-history cells and current streak count `7`. | Seeded data verification, visual color assertion, and browser verification are blocked until deployed URL and seeded fixture details are supplied. |
| Visitor opens an unknown route and sees a branded not-found message with a home link | `features/not-found-page.feature` | `tests/smoke/not-found.spec.ts` | `STREAKBEACON_BASE_URL` | `npx playwright test tests/smoke/not-found.spec.ts` | Unknown route returns a visible not-found heading and a visible link back to the home page that navigates to the home view. | Real deployed-site execution and home-navigation verification are blocked until `deploy_url` is supplied; spec skips cleanly when env is absent. |

## Current Blocked Checks

The smoke skeleton can be installed and dry-run for skip behavior without a
deployment. The following checks remain blocked until `deploy_url` is recorded
and approved seeded credentials are available:

- Execute `npm run test:smoke` against the deployed Vercel URL with real
  credentials.
- Confirm the deployed login flow reaches the authenticated dashboard.
- Confirm today's streak control can be located and marked using public UI.
- Confirm Playwright produces failure screenshots/videos/traces for a real
  deployed-site failure.
- Automate the pending create-habit and dashboard streak-grid scenarios without
  relying on application source or private APIs.
