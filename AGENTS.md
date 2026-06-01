# StreakBeacon Tests Agent Guide

This repository is for black-box StreakBeacon test automation against a deployed Vercel URL.

## Stack Signals

Current repo-root inspection shows a Playwright/TypeScript test stack:

- `package.json`
- `playwright.config.ts`
- `features/`
- `tests/`

Re-detect the stack from the repo root before adding or running automation.

## Required Input

Tests must run only against a deployed Vercel URL for StreakBeacon.

Use `STREAKBEACON_BASE_URL` for the deployed Vercel URL. Get the deployed Vercel URL from the issue metadata or release handoff and document exactly how it was supplied in the result comment.

Do not run tests against localhost or by importing the application source.

## Black-Box Constraints

- Do not inspect, import, mock, or depend on files from `streakbeacon-app`.
- Do not reach into Vercel internals, database state, or private application APIs unless the public product workflow uses them.
- Exercise the deployed site the way a user would: browser navigation, visible UI, public network behavior, and documented user credentials or test accounts.
- Keep test data and credentials out of the repository. Supply seeded credentials with `STREAKBEACON_TEST_EMAIL` and `STREAKBEACON_TEST_PASSWORD` until a platform-approved secret mechanism is documented.

## Repo-Local Commands

Install dependencies:

```bash
npm install
```

Install Playwright browsers and required system dependencies:

```bash
npm run install:browsers
```

This runs `playwright install --with-deps`, which installs the Playwright
browser binaries plus the Linux system packages they need (fonts, audio,
graphics libraries). On Debian/Ubuntu hosts this step requires sudo or root
because `--with-deps` invokes `apt-get`; on hosts without apt (or without
root) install the browsers without system deps via `npx playwright install`
and install the system packages out-of-band, then re-run tests.

Run the smoke test:

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> STREAKBEACON_TEST_EMAIL=<seeded-email> STREAKBEACON_TEST_PASSWORD=<seeded-password> npm run test:smoke
```

Run all tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Format repository files:

```bash
npm run format
```

## Gherkin Gate

Before implementing or changing automation, validate that each scenario has clear Gherkin coverage:

- Feature describes a user-observable capability.
- Scenario steps are black-box and do not mention implementation details.
- Assertions are based on visible UI, browser behavior, or public product outcomes.
- Any known unsupported setup, credentials, or deployed URL dependency is called out before execution.

Do not treat a test change as ready if the Gherkin intent is missing, ambiguous, or coupled to app internals.

## Failure Reporting

When reporting a run, include:

- Deployed Vercel URL tested
- Branch and commit tested from this repository
- Exact command run, or the reason no command could run
- Browser(s) used when known
- Pass/fail summary
- For failures: scenario name, observed behavior, expected behavior, screenshots/traces/videos if produced, and whether the failure appears to be test setup, product behavior, or environment

If commands are missing, report the gap plainly instead of substituting a different toolchain.

## Branch Rules

- Work on a focused feature branch for one issue.
- Do not push directly to a default branch.
- Keep changes limited to this test repository unless the issue explicitly assigns cross-repo coordination.
- Pull requests should state the deployed URL requirement and list checks run or skipped with reasons.
