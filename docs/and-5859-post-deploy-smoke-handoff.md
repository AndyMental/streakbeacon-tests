# AND-5859 Post-Deploy Smoke Handoff

This handoff prepares AND-5288 deploy-time Playwright smoke execution from the
current black-box Gherkin coverage in `streakbeacon-tests`. It does not inspect
or depend on `streakbeacon-app` source. Browser execution remains blocked until
a deployed Vercel URL is supplied as `STREAKBEACON_BASE_URL` or issue metadata
key `deploy_url`, with any required seeded credentials supplied out of band.

## Deploy-Independent Gherkin Inventory

| Feature file                                    | Deploy-independent scenarios | Post-deploy role                                                                             |
| ----------------------------------------------- | ---------------------------: | -------------------------------------------------------------------------------------------- |
| `features/create-habit.feature`                 |                            2 | Primary dashboard smoke source for empty state and first habit creation.                     |
| `features/today-streak-completion.feature`      |                            2 | Primary completion smoke source for marking and unmarking today.                             |
| `features/dashboard-streak-grid-render.feature` |                            2 | Streak-grid render verification once deterministic local data setup exists.                  |
| `features/local-persistence.feature`            |                            1 | Reload persistence verification after the smoke flow creates or seeds data.                  |
| `features/not-found-page.feature`               |                            2 | Public no-auth smoke source for branded 404 recovery.                                        |
| `features/app-shell-resilience.feature`         |                            5 | Public a11y/resilience smoke source; delayed/error cases need approved public fixture paths. |
| `features/settings-panel.feature`               |                            7 | Settings backup, import, reset, and theme coverage after deterministic local data setup.     |
| `features/streak-grid-interactions.feature`     |                            5 | Grid interaction regression coverage after deterministic multi-day setup exists.             |
| `features/delete-habit.feature`                 |                            2 | Dashboard cleanup/regression coverage after a created or seeded habit exists.                |
| `features/edit-habit.feature`                   |                            1 | Dashboard edit regression coverage after a created or seeded habit exists.                   |
| `features/weekly-overview.feature`              |                            2 | Weekly summary regression coverage after deterministic dated setup exists.                   |
| `features/visual-regression-baselines.feature`  |                            4 | Visual regression coverage after a deploy URL and stable visual state are available.         |
| `features/backend-api-contract.feature`         |                            2 | Records that API automation is not applicable until a public API contract exists.            |

Current inventory total: 37 scenarios, with 8 tagged `@smoke`.

## Minimal Post-Deploy Smoke Set

Run this set first after `deploy_url` is available. It covers the smallest
release-blocking surface from AND-5288 without requiring app-source imports.

| Order | Scenario                                                              | Source                                          | Existing automation                                                                                             | Required inputs                                                                                             | Pass signal                                                              |
| ----: | --------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
|     1 | Visitor opens an unknown route                                        | `features/not-found-page.feature`               | `tests/not-found-page.spec.ts`                                                                                  | `STREAKBEACON_BASE_URL`                                                                                     | Branded not-found copy appears with a home link.                         |
|     2 | Visitor returns home from the not found page                          | `features/not-found-page.feature`               | `tests/not-found-page.spec.ts`                                                                                  | `STREAKBEACON_BASE_URL`                                                                                     | Home page is visible after using the recovery link.                      |
|     3 | Keyboard user skips directly to main content                          | `features/app-shell-resilience.feature`         | `tests/app-shell-resilience.spec.ts`                                                                            | `STREAKBEACON_BASE_URL`                                                                                     | First Tab focuses the skip link.                                         |
|     4 | Keyboard user activates the skip link                                 | `features/app-shell-resilience.feature`         | `tests/app-shell-resilience.spec.ts`                                                                            | `STREAKBEACON_BASE_URL`                                                                                     | Focus moves to `main` and URL hash matches the skip target.              |
|     5 | User adds a first habit and sees a zero streak                        | `features/create-habit.feature`                 | Pending                                                                                                         | `STREAKBEACON_BASE_URL`; clean local store strategy                                                         | Habit named `Read` appears with current streak `0`.                      |
|     6 | User marks today's habit complete                                     | `features/today-streak-completion.feature`      | `tests/smoke/login-mark-today.spec.ts` covers the older seeded-login path and needs local-first state alignment | `STREAKBEACON_BASE_URL`; deterministic habit named `Read`; fixed date or date-insensitive selector strategy | Today's grid cell for `Read` is completed and current streak is `1`.     |
|     7 | User sees saved habits after reload                                   | `features/local-persistence.feature`            | Pending                                                                                                         | Same browser context as habit creation/completion                                                           | `Read` and today's completed cell persist after reload.                  |
|     8 | Habit with 7 contiguous marked days shows a filled recent-history row | `features/dashboard-streak-grid-render.feature` | Pending                                                                                                         | Deterministic seven-day local data setup                                                                    | Seven completed recent-history cells and current streak `7` are visible. |

Do not expand beyond this set until the smoke run produces a stable deployed
baseline. Settings, edit/delete, weekly overview, visual baselines, delayed
loading, and error fallback scenarios remain second-wave coverage because they
need additional deterministic state, fixture paths, or visual baselines.

## Selector And Flow Handoff

Use public user-facing selectors first. Avoid implementation classes,
application imports, private APIs, or storage keys unless a future QA handoff
explicitly approves a black-box state setup mechanism.

Open app:
Use `page.goto('/')`. `playwright.config.ts` reads `STREAKBEACON_BASE_URL` as
`baseURL`.

Empty dashboard:
Prefer visible copy matching `/empty|no habits|add.*habit/i` and a button named
`/add habit|new habit/i`. Fall back to the main landmark plus the first visible
habit creation form. This requires a clean or resettable local store.

Create habit:
Prefer an input labelled or placeholdered `/habit name|name/i` and a button
named `/add habit|create|save/i`. Fall back to the first visible textbox in the
dashboard habit form. Submit `Read`, then assert visible row/list text before
further actions.

Mark today:
Prefer a button or checkbox named with `Read` and
`/today|mark|complete|done|check in/i`. Fall back to a button or checkbox named
`/today|mark complete|complete today|done today/i`. Prefer accessible role/name;
fixed date should only guide label fallbacks.

Assert completed today:
Prefer checkbox checked state, `aria-checked=true`, or `aria-pressed=true`.
Fall back to visible completed/done text near the `Read` row. Class-name
assertions are last resort and should be replaced by public semantics when
available.

Assert streak count:
Prefer text near `Read` matching `/current streak/i` and `1` or `7`. Fall back
to row-scoped text matching `/streak/i` plus the expected count so assertions do
not match summary text elsewhere.

Reload persistence:
Use `page.reload()`, then assert row text `Read` and completed today state. Fall
back to `page.goto('/')` in the same browser context. Do not clear browser
context between create/mark and reload checks.

Not found:
Use `page.goto('/black-box-not-found-<unique>')`, branded text
`/streakbeacon/i`, not-found text `/not found|404|missing/i`, and a recovery
link named `/home|go back|return|streakbeacon/i`. This is already covered by
`tests/not-found-page.spec.ts`.

Skip link:
Press `Tab`, assert a focused link named `/skip to main content/i`, then use
`getByRole('main')` and the link `href` hash target for activation assertions.
This is already covered by `tests/app-shell-resilience.spec.ts`.

## Exact Deploy Trigger

Run the handoff when AND-5288 or this issue records a stable HTTPS Vercel URL in
metadata as `deploy_url`, or when the release handoff provides the same value.
The minimum command shape is:

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> npm test
```

For the current seeded-login smoke scaffold, include credentials only when the
approved deployed flow still requires them:

```bash
STREAKBEACON_BASE_URL=<deployed-vercel-url> \
STREAKBEACON_TEST_EMAIL=<seeded-email> \
STREAKBEACON_TEST_PASSWORD=<seeded-password> \
npm run test:smoke
```

If no `deploy_url` exists, report the run as blocked on
`STREAKBEACON_BASE_URL` and do not substitute localhost.

## Non-Duplication Notes

- AND-5810 was a deploy-independent Gherkin authoring-gap slice and is
  cancelled; this handoff inventories existing coverage and execution order
  instead of authoring new feature scenarios.
- AND-5830 is scoped to storage resilience scenarios such as disabled storage,
  quota exceeded, malformed stored data, and recovery; this handoff does not
  add or validate that storage-resilience Gherkin.
- AND-5852 belongs to AND-5289 and Rails route smoke assertions, not the
  StreakBeacon Playwright deployed-URL suite.
