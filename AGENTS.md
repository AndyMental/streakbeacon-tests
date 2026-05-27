# StreakBeacon Tests Agent Guide

This repository is for black-box StreakBeacon test automation against a deployed Vercel URL.

## Stack Signals

Current repo-root inspection shows no stack files yet:

- No `package.json`
- No Playwright config
- No Python, Java, Ruby, or other build manifest
- No existing test directory or feature files

Treat this as an unbootstrapped test repository until those files exist. Re-detect the stack from the repo root before adding or running automation.

## Required Input

Tests must run only against a deployed Vercel URL for StreakBeacon.

Gap: this repository does not yet define a canonical environment variable, config file, or CLI flag for that URL. Until the test harness defines one, get the deployed Vercel URL from the issue metadata or release handoff and document exactly how it was supplied in the result comment.

Do not run tests against localhost or by importing the application source.

## Black-Box Constraints

- Do not inspect, import, mock, or depend on files from `streakbeacon-app`.
- Do not reach into Vercel internals, database state, or private application APIs unless the public product workflow uses them.
- Exercise the deployed site the way a user would: browser navigation, visible UI, public network behavior, and documented user credentials or test accounts.
- Keep test data and credentials out of the repository. Use the platform-approved secret mechanism when one is documented.

## Repo-Local Commands

No install, test, lint, format, browser setup, or Playwright run commands are present yet because the repository has no stack manifest or scripts.

When a stack is added, update this section with the exact repo-local commands from the committed files. Do not guess commands from memory or from the application repository.

Current gaps to resolve during test harness setup:

- Install command: missing
- Test command: missing
- Lint command: missing
- Format command: missing
- Browser setup command: missing
- Playwright run command: missing
- Deployed URL variable/config name: missing

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

