# AND-6501 Owner-Gate Smoke Checklist

This checklist prepares AND-5288 QA coverage for the owner-merge gates on app
PR #101, app PR #102, tests PR #34, and app PR #81. It is deploy-independent:
no Playwright browser run should start until a stable Vercel URL is supplied as
`STREAKBEACON_BASE_URL`.

## PRD Surface Map

| Owner gate               | Change surface                                                                                                                                             | AND-5288 PRD acceptance surface                                                                                                                     | Existing Gherkin / smoke source                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| app PR #101 (`f1774d6`)  | Dashboard habit search exposes the search input with the programmatic label `Search habits`.                                                               | All Habits discovery and filtering; accessible dashboard controls.                                                                                  | `features/all-habits-discovery.feature` - `User filters the All Habits grid by habit name`; `docs/and-5739-gherkin-validation.md` All Habits map.                                                          |
| app PR #102 (`1709897`)  | Settings paste-JSON import textarea is connected to a visible `Export JSON` label.                                                                         | Settings import valid JSON; import invalid JSON rejection; backup/restore controls are operable by assistive technology.                            | `features/settings-panel.feature` - `User previews a valid JSON import`, `User confirms a valid JSON import`, `User sees invalid JSON import rejected`; `docs/and-5739-gherkin-validation.md` import rows. |
| tests PR #34 (`fbb4f1a`) | Weekly overview Gherkin expands from the coarse completion-count scenario into row-level active/open/archived/a11y coverage, and updates the smoke matrix. | Weekly overview for current progress; only active habits shown; screen-reader status for weekly cells; no overview when there are no active habits. | `features/weekly-overview.feature`; `docs/smoke-test-matrix.md` weekly overview pending smoke row on the PR branch.                                                                                        |
| app PR #81 (`de6c09c`)   | Dashboard and weekly overview use the current date instead of the fixed demo date, with date-mocked unit coverage.                                         | Mark today; current week weekly overview; recent-history streak grid ending today.                                                                  | `features/today-streak-completion.feature`; `features/weekly-overview.feature`; `features/dashboard-streak-grid-render.feature`.                                                                           |

## Deploy-Independent Checks Runnable Now

Run these on the relevant PR branch or merge candidate before the Vercel gate:

| Check                    | Repo                 | Command                                                                                           | Gate covered                                                                                         |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| App dependency install   | `streakbeacon-app`   | `npm install`                                                                                     | Required before every app preflight per AGENTS.md.                                                   |
| App preflight            | `streakbeacon-app`   | `npm run preview:preflight`                                                                       | PR #101, PR #102, and PR #81 unit/lint/format/build coverage.                                        |
| App contract tests       | `streakbeacon-app`   | `npm run test:contract`                                                                           | Confirms no public API contract regression; expected to remain local-first/no backend API.           |
| Tests dependency install | `streakbeacon-tests` | `npm install`                                                                                     | Required before linting or later Playwright runs.                                                    |
| Tests lint               | `streakbeacon-tests` | `npm run lint`                                                                                    | PR #34 Gherkin/docs style and TypeScript lint gate.                                                  |
| Gherkin review           | `streakbeacon-tests` | Manual review of `features/weekly-overview.feature` against `docs/and-5739-gherkin-validation.md` | Confirms PR #34 scenarios are deterministic, user-observable, and non-duplicative before automation. |

## Deploy-URL-Only Checks After Vercel

Do not run these until `STREAKBEACON_BASE_URL` is available and points to the
deployed owner-gate build.

| Check                              | Command shape                                                         | Owner gates covered                                                 | Pass signal                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Full deployed smoke                | `STREAKBEACON_BASE_URL=<deployed-vercel-url> npm test`                | PR #101, PR #102, PR #34, PR #81                                    | Public browser flows execute against the deployed origin only.                                                    |
| Minimal smoke fallback             | `STREAKBEACON_BASE_URL=<deployed-vercel-url> npm run test:smoke`      | PR #81 today-date behavior once local-first state setup is approved | Today's completion is observable on the deployed dashboard.                                                       |
| Weekly overview browser validation | Pending automation after PR #34 validation and state setup approval   | PR #34 and PR #81                                                   | Weekly overview shows the last 7 days ending today, active habits only, and accessible completed/open cell names. |
| Accessibility selector check       | Included in deployed Playwright coverage once selectors are reachable | PR #101 and PR #102                                                 | Search and paste-JSON controls are locatable by public label text, not implementation-only test IDs.              |

## Current QA Position

- No deployed URL is recorded on AND-6501 metadata, so black-box Playwright is
  blocked.
- PR #101 and PR #102 are covered locally by app unit tests that assert
  programmatic labels for the affected controls.
- PR #34 is a tests-repo Gherkin/docs expansion and should be validated before
  any new weekly-overview Playwright automation starts.
- PR #81 is covered locally by app unit tests with a mocked current date, and it
  needs deployed smoke after owner merge because the user-facing date changes
  depend on the real runtime date.
