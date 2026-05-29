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

`STREAKBEACON_BASE_URL` is the only required environment variable for black-box automation. StreakBeacon is a local-first app with no authentication surface (per AND-5634/AND-5288), so no seeded account credentials are needed. Browser-local state (e.g. `localStorage`, `IndexedDB`) is the persistence layer; tests must establish required state through the public UI rather than via seeded server-side accounts.

Do not run tests against localhost or by importing the application source.

## Black-Box Constraints

- Do not inspect, import, mock, or depend on files from `streakbeacon-app`.
- Do not reach into Vercel internals, database state, or private application APIs unless the public product workflow uses them.
- Exercise the deployed site the way a user would: browser navigation, visible UI, and public network behavior.
- Do not commit test data, fixtures, or any future credentials to the repository. If a future feature introduces an authenticated surface, add a platform-approved secret mechanism before re-introducing credential env vars; do not reintroduce `STREAKBEACON_TEST_EMAIL` / `STREAKBEACON_TEST_PASSWORD` without updating this guide and the matrix in lockstep.

## Repo-Local Commands

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npm run install:browsers
```

Run the smoke test:

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> npm run test:smoke
```

Run all tests:

```bash
npm test
```

Current gaps to resolve during future test harness setup:

- Lint command: missing
- Format command: missing

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
