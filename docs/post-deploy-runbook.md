# Post-Deploy Playwright Runbook: StreakBeacon Smoke & Regression

This runbook defines the validation procedure for StreakBeacon after a stable Vercel deployment. It covers the smoke and regression surface defined by PR gates #34, #41, #81, #101, #102, #103, and #105.

## 1. Prerequisites

### Environment Variables
The following environment variables are required for a full black-box run.

| Variable | Description | Source |
| :--- | :--- | :--- |
| `STREAKBEACON_BASE_URL` | The deployed Vercel URL (HTTPS). | Issue metadata `deploy_url` or release handoff. |
| `STREAKBEACON_TEST_EMAIL` | Seeded test account email. | Platform-approved secret mechanism. |
| `STREAKBEACON_TEST_PASSWORD` | Seeded test account password. | Platform-approved secret mechanism. |

### Toolchain
- Node.js (>= 20.9.0)
- npm

## 2. Setup

Install dependencies and Playwright browsers:

```bash
npm install
npm run install:browsers
```

## 3. Validation Suites

### Tier 1: Deploy-Independent Validation (Pre-flight)
These checks ensure the test repository is healthy and do not require a deployed URL.

| Step | Command | Purpose |
| :--- | :--- | :--- |
| 1 | `npm run lint` | Verify code style and linting rules. |
| 2 | `npm run format` | Ensure consistent formatting. |

### Tier 2: Deploy-URL Smoke Suite (Release-Blocking)
These tests must pass for every deployment. They cover the core app-shell and critical user paths.

| Gate | Scenario | Command |
| :--- | :--- | :--- |
| #102 | Branded 404 Page | `STREAKBEACON_BASE_URL=<url> npx playwright test tests/smoke/not-found.spec.ts` |
| #103 | App Shell (Skip Link) | `STREAKBEACON_BASE_URL=<url> npx playwright test tests/app-shell-resilience.spec.ts` |
| #101 | Dashboard Theme Toggle | `STREAKBEACON_BASE_URL=<url> STREAKBEACON_TEST_EMAIL=<e> STREAKBEACON_TEST_PASSWORD=<p> npx playwright test tests/smoke/theme-toggle.spec.ts` |
| Core | Login & Mark Today | `STREAKBEACON_BASE_URL=<url> STREAKBEACON_TEST_EMAIL=<e> STREAKBEACON_TEST_PASSWORD=<p> npm run test:smoke` |

### Tier 3: Regression Suite (Feature-Specific)
Extended coverage for specific PR gates and features.

| Gate | Feature | Command |
| :--- | :--- | :--- |
| #34 | Reset All Data | `STREAKBEACON_BASE_URL=<url> npx playwright test tests/settings/export-import-reset.spec.ts` |
| #41 | Selected Deletion | `STREAKBEACON_BASE_URL=<url> npx playwright test features/delete-habit.feature` (Gherkin validation) |
| #105 | Weekly Overview | `STREAKBEACON_BASE_URL=<url> npx playwright test features/weekly-overview.feature` (Gherkin validation) |
| #81 | Grid Settings | `STREAKBEACON_BASE_URL=<url> npx playwright test tests/visual/grid-settings.spec.ts` |

## 4. Execution Workflow

1. **Check Metadata**: Verify `deploy_url` is present in issue metadata.
2. **Pre-flight**: Run `npm run lint`.
3. **Execute Smoke**: Run `npm run test:smoke` (if credentials available) or target specific smoke specs.
4. **Execute Regression**: Run `npm test` for full coverage.
5. **Report**: Follow the reporting format in `AGENTS.md`, including the `STREAKBEACON_BASE_URL` used.

## 5. Troubleshooting

- **Skip Behavior**: If `STREAKBEACON_BASE_URL` is missing, Playwright specs will skip. This is expected behavior for deploy-independent runs.
- **Credential Failure**: If authenticated tests fail, verify `STREAKBEACON_TEST_EMAIL` and `STREAKBEACON_TEST_PASSWORD` match the seeded account on the target environment.
