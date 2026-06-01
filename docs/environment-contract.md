# StreakBeacon Playwright Environment Contract

This contract is for running the `streakbeacon-tests` Playwright suite against a
deployed StreakBeacon Vercel URL. The suite is black-box only and must not run
against localhost or app source.

## Required GitHub Actions / Playwright inputs

| Key                          | Store as                                                                        | Expected value                                                                  | Required for              | Notes                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `STREAKBEACON_BASE_URL`      | GitHub Actions variable or job env sourced from issue metadata / deploy handoff | HTTPS deployed Vercel URL, for example `https://streakbeacon-branch.vercel.app` | Every Playwright run      | Current `playwright.config.ts` reads this as Playwright `baseURL`. Do not set to localhost. |
| `STREAKBEACON_TEST_EMAIL`    | GitHub Actions secret                                                           | Seeded test account email string                                                | Authenticated smoke flows | Must belong to an approved resettable test account. Do not commit the value.                |
| `STREAKBEACON_TEST_PASSWORD` | GitHub Actions secret                                                           | Password string for `STREAKBEACON_TEST_EMAIL`                                   | Authenticated smoke flows | Do not commit the value. Rotate if exposed in logs.                                         |

## Vercel app environment

The current local-first app does not require private Vercel secrets for build or
runtime.

| Key                             | Store as                             | Expected value                 | Required for           | Notes                                                                                                                       |
| ------------------------------- | ------------------------------------ | ------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Optional Vercel environment variable | Production canonical URL       | Sitemap canonical URLs | Optional. If omitted, the app falls back to Vercel-provided `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`, then localhost. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Vercel system env                    | Vercel project production host | Sitemap fallback       | Provided by Vercel when available; do not manually create a secret for it.                                                  |
| `VERCEL_URL`                    | Vercel system env                    | Vercel deployment host         | Sitemap fallback       | Provided by Vercel when available; do not manually create a secret for it.                                                  |

## Current command shape

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> npm run test:smoke
```

## Pending URL injection alignment

AND-6044 requests `DEPLOY_URL` support for deploy URL injection. Until that
change lands, the current suite requires `STREAKBEACON_BASE_URL`. If `DEPLOY_URL`
is added as an alias, GitHub Actions should map the Vercel deploy URL into the
alias and preserve the deployed URL plus any authenticated-flow credentials:

- deployed URL
- seeded test email, only for authenticated specs
- seeded test password, only for authenticated specs
