# StreakBeacon Deployed-URL Smoke Matrix

This matrix defines the black-box smoke coverage that can run once a stable
StreakBeacon Vercel deployment is supplied. Tests must use only the public
deployed site and seeded credentials; do not import or inspect app source.

## Required Inputs

| Input                        | Source                                             | Required for              | Notes                                                                      |
| ---------------------------- | -------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `STREAKBEACON_BASE_URL`      | Issue metadata key `deploy_url` or release handoff | Every Playwright run      | Must be a deployed Vercel URL, not localhost.                              |
| `STREAKBEACON_TEST_EMAIL`    | Approved seeded test account secret                | Authenticated smoke flows | Do not commit the value.                                                   |
| `STREAKBEACON_TEST_PASSWORD` | Approved seeded test account secret                | Authenticated smoke flows | Do not commit the value.                                                   |
| `STREAKBEACON_DELAYED_PATH`  | Release handoff or QA fixture note                 | Gated loading check       | Public deployed path that keeps loading observable long enough to assert.  |
| `STREAKBEACON_ERROR_PATH`    | Release handoff or QA fixture note                 | Gated error checks        | Public deployed path that renders a recoverable App Router error fallback. |

## Command

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> \
STREAKBEACON_TEST_EMAIL=<seeded-email> \
STREAKBEACON_TEST_PASSWORD=<seeded-password> \
npm run test:smoke
```

## Expected Artifacts

| Artifact             | Location             | When produced    | Expected result                                                          |
| -------------------- | -------------------- | ---------------- | ------------------------------------------------------------------------ |
| List reporter output | Terminal             | Every run        | Chromium project reports smoke scenario pass/fail/skip.                  |
| HTML report          | `playwright-report/` | Every run        | Openable Playwright report with the executed smoke result.               |
| Trace                | `test-results/`      | First retry only | Available for retry diagnostics if the smoke test flakes or fails in CI. |
| Screenshot           | `test-results/`      | Failure only     | Captures the failed page state.                                          |
| Video                | `test-results/`      | Failure only     | Captures the failed browser session.                                     |

## Smoke Coverage

| Scenario                                                              | Gherkin source                                  | Automation                                                                                                                                                 | URL/env prerequisite                                                                                                            | Command                                                                                | Pass condition                                                                                                      | Blocked until deploy URL                                                                                                                        |
| --------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| User marks today's habit complete                                     | `features/today-streak-completion.feature`      | `tests/smoke/login-mark-today.spec.ts` currently covers the older seeded-login smoke path and needs local-first refactor before this scenario is automated | `STREAKBEACON_BASE_URL` and a deterministic local-first state setup strategy                                                    | Pending automation after Gherkin validation and state setup strategy                   | Today's grid cell for `Read` is shown as completed and current streak count is `1`.                                 | Browser verification is blocked until a deployed URL and approved local-first state strategy are supplied.                                      |
| User adds a first habit and sees a zero streak                        | `features/create-habit.feature`                 | Pending                                                                                                                                                    | `STREAKBEACON_BASE_URL` and a deterministic clean or resettable local store                                                     | Pending automation after Gherkin validation and state setup strategy                   | The created habit appears in the visible list with streak count `0`.                                                | Selector discovery, state setup/reset, and browser verification are blocked until a deployed URL and approved test-state strategy are supplied. |
| Habit with 7 contiguous marked days shows a filled recent-history row | `features/dashboard-streak-grid-render.feature` | Pending                                                                                                                                                    | `STREAKBEACON_BASE_URL` and deterministic local data containing a habit named `Read` with 7 contiguous marked days ending today | Pending automation after deterministic data setup is available                         | Dashboard shows 7 filled recent-history cells and current streak count `7`.                                         | State setup verification, visual color assertion, and browser verification are blocked until deployed URL and fixture details are supplied.     |
| Visitor opens an unknown route                                        | `features/not-found-page.feature`               | Covered by `tests/smoke/app-shell-resilience.spec.ts`                                                                                                      | `STREAKBEACON_BASE_URL`                                                                                                         | `npm run test:smoke -- --grep "visitor sees a branded 404 page"`                       | Unknown routes return HTTP 404, show branded not-found copy, and provide a visible home link.                       | Browser verification is blocked until a deployed URL for the branch is supplied.                                                                |
| User sees loading status while app content is pending                 | `features/app-shell-resilience.feature`         | Conditionally covered by `tests/smoke/app-shell-resilience.spec.ts`                                                                                        | `STREAKBEACON_BASE_URL` and `STREAKBEACON_DELAYED_PATH`                                                                         | `STREAKBEACON_DELAYED_PATH=<path> npm run test:smoke -- --grep "loading status"`       | A public loading affordance is exposed as `role=status`, announces StreakBeacon loading, and does not trap focus.   | Scenario skips until a deterministic deployed delayed-content route or fixture path is supplied.                                                |
| User can recover from an error fallback                               | `features/app-shell-resilience.feature`         | Conditionally covered by `tests/smoke/app-shell-resilience.spec.ts`                                                                                        | `STREAKBEACON_BASE_URL` and `STREAKBEACON_ERROR_PATH`                                                                           | `STREAKBEACON_ERROR_PATH=<path> npm run test:smoke -- --grep "recover from an error"`  | The fallback exposes a visible error alert and reset control.                                                       | Scenario skips until a deterministic deployed error fallback route or fixture path is supplied.                                                 |
| User retries after an error fallback                                  | `features/app-shell-resilience.feature`         | Conditionally covered by `tests/smoke/app-shell-resilience.spec.ts`                                                                                        | `STREAKBEACON_BASE_URL` and `STREAKBEACON_ERROR_PATH`                                                                           | `STREAKBEACON_ERROR_PATH=<path> npm run test:smoke -- --grep "retries after an error"` | Activating reset reloads or retries the app view and removes the error alert after recovery succeeds.               | Scenario skips until a deterministic deployed recoverable error route or fixture path is supplied.                                              |
| Keyboard user skips directly to main content                          | `features/app-shell-resilience.feature`         | Covered by `tests/smoke/app-shell-resilience.spec.ts`                                                                                                      | `STREAKBEACON_BASE_URL`                                                                                                         | `npm run test:smoke -- --grep "skips directly to main content"`                        | Pressing Tab once focuses a visible "Skip to main content" link.                                                    | Browser verification is blocked until a deployed URL for the branch is supplied.                                                                |
| Keyboard user activates the skip link                                 | `features/app-shell-resilience.feature`         | Covered by `tests/smoke/app-shell-resilience.spec.ts`                                                                                                      | `STREAKBEACON_BASE_URL`                                                                                                         | `npm run test:smoke -- --grep "activates the skip link"`                               | Activating the skip link moves focus to the main landmark and updates the location hash to the main content target. | Browser verification is blocked until a deployed URL for the branch is supplied.                                                                |

## Required Accessibility Hooks for AND-5571, AND-5572, and AND-5574

| Surface        | Required public hook                                                                                                                                        | Automation reason                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading UI     | Loading affordance exposed with `role="status"` and an accessible name or text matching `Loading StreakBeacon` or equivalent product-specific loading copy. | Lets Playwright assert the pending state with `getByRole('status', { name: /loading.*streakbeacon/i })` or visible status text without relying on implementation classes. |
| Error fallback | Error message exposed with `role="alert"` and user-visible StreakBeacon error copy.                                                                         | Lets automation distinguish an app fallback from normal page content and verify screen-reader announcement semantics.                                                     |
| Error reset    | Reset/retry control exposed as a `button` with accessible name matching `Try again`, `Retry`, or `Reset`.                                                   | Lets automation recover through the same public control a user receives, without importing app internals.                                                                 |
| Skip link      | First tabbable control exposed as a link named `Skip to main content`, visible on focus.                                                                    | Lets automation verify first-Tab behavior with keyboard-only interaction.                                                                                                 |
| Main target    | Main content exposed as a `main` landmark with a stable target such as `id="main-content"` and programmatic focus support after skip activation.            | Lets automation assert focus movement using public accessibility semantics and URL hash behavior.                                                                         |

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
- Execute the conditional loading and error fallback/reset checks once the
  deployed branch exposes deterministic public fixture paths for those surfaces.
