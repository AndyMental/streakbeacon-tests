# AND-5567 Coverage Note — 404 Page (AND-5561) & Theme Toggle (AND-5562)

Black-box coverage prep so the two PRD surfaces can be validated as soon as a
stable Vercel deployment URL is supplied. All Playwright specs added by this
card are gated on `STREAKBEACON_BASE_URL` and skip cleanly when it is absent,
matching the pattern used by the smoke specs.

## Goalpost trace

- Parent goalpost: AND-5288 — PRD acceptance line lists "404 page" and
  "dark/light" toggle as features to verify on the deployed app.
- Implementation cards under test:
  - AND-5561 — `app/not-found.tsx` (PR
    https://github.com/AndyMental/streakbeacon-app/pull/27, status `in_review`).
  - AND-5562 — dashboard theme toggle (status `in_progress`; PR not yet open at
    write time).
- This card (AND-5567) adds Gherkin + skipped Playwright skeletons against the
  deployed Vercel URL; it must not import StreakBeacon app source.

## Surface 1 — 404 page (AND-5561)

### Gherkin

- `features/not-found-page.feature` already exists and covers both checks:
  - unknown route renders branded message,
  - link back to home navigates to `/`.
  - Tags: `@smoke @critical`. No changes required.

### Black-box checks

| Check                     | Behavior under test                        | Pass condition                                                                    |
| ------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| Unknown route renders 404 | Navigate to `/__not_a_real_route_${nonce}` | Page contains a "not found" branded message AND the home link control is visible. |
| Home link returns to `/`  | Click the home link from the 404 page      | URL resolves to `${STREAKBEACON_BASE_URL}` (path `/`) and the home page is shown. |

### Required selector / a11y contract (implementation must expose)

| Selector                                               | Source                                        | Status    | Notes                                                                                                                               |
| ------------------------------------------------------ | --------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `[data-testid="not-found-home-link"]`                  | AND-5561 result comment (confirmed in PR #27) | Confirmed | Stable, black-box safe. Spec targets this first; falls back to `getByRole('link', { name: /home/i })` only if the testid is absent. |
| Heading text containing "not found" (case-insensitive) | AND-5561 scope                                | Confirmed | Used for branded-message assertion.                                                                                                 |

### Spec

- `tests/smoke/not-found.spec.ts` (new). Skips when `STREAKBEACON_BASE_URL` is
  unset (parity with existing smoke).

## Surface 2 — Theme toggle (AND-5562)

### Gherkin

- `features/dashboard-theme-toggle.feature` (new in this card). Covers the
  dashboard-surface scenario because PRD requires a user-visible toggle on the
  active dashboard surface; the existing `features/settings-panel.feature`
  scenario `User changes the theme setting` covers the settings-panel location
  alternative. AND-5562's scope explicitly leaves the location choice to the
  implementer ("dashboard header or settings panel"), so coverage must work for
  either landing spot — the new feature targets the dashboard surface, the
  existing one targets the settings panel, and the spec probes both before
  failing.

### Black-box checks

| Check                          | Behavior under test                                                        | Pass condition                                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Toggle is reachable post-login | Login as seeded user, look for the theme toggle on dashboard then settings | At least one of the two surfaces exposes the toggle control.                                                                                     |
| Toggle flips the visible theme | Click/activate the toggle                                                  | The `<html>` element's `class` list or `data-theme` attribute changes between `light` and `dark` (or vice versa) without a full page navigation. |
| Persistence across reload      | Reload the page after toggling                                             | The post-reload `<html>` class / `data-theme` attribute matches the value set before reload.                                                     |

### Required selector / a11y contract (implementation must expose)

AND-5562 has not landed yet; the following are the recommended contract the QA
spec will look for. The implementing agent (Frontend on AND-5562) needs to
expose at least one of these — flagged in this comment as the QA dependency:

| Selector / signal                                                                                                                                                                          | Why                                                                                                                                     | Fallback the spec probes                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `[data-testid="theme-toggle-dark"]` and `[data-testid="theme-toggle-light"]` on actionable child options, or equivalent radio/button/menu item controls named `Dark theme` / `Light theme` | Stable, black-box safe, and avoids clicking a non-actionable group container.                                                           | Radio, button, or menu item roles named for dark/light theme.                                  |
| Optional `[data-testid="theme-toggle"]` on the group/root control                                                                                                                          | Useful as a scoped container only.                                                                                                      | The spec searches child controls under this container; it does not click the container itself. |
| Accessible name on each actionable child option containing `dark` or `light`                                                                                                               | Lets the spec fall back to role-name lookup if the testid is missing.                                                                   | n/a                                                                                            |
| Theme state observable from the public DOM, via either `document.documentElement.classList` containing `light`/`dark` or a `data-theme` attribute on `<html>`                              | The spec must verify state without inspecting app source; the AND-5481 provider already drives one of these per AND-5562's vitest plan. | spec checks both `class` and `data-theme` before failing.                                      |
| Persistence via the provider's existing mechanism (no new env var, no app-source inspection)                                                                                               | Spec asserts via reload only.                                                                                                           | n/a                                                                                            |

### Spec

- `tests/smoke/theme-toggle.spec.ts` (new). Skips when
  `STREAKBEACON_BASE_URL`/`STREAKBEACON_TEST_EMAIL`/`STREAKBEACON_TEST_PASSWORD`
  are unset.

## Gating + execution

- All new specs follow the existing `test.skip(missingEnv.length > 0, ...)`
  pattern from the smoke specs. When the deploy URL is
  absent the specs are reported as skipped, not failed, so CI stays green
  pre-deploy.
- The 404 spec only requires `STREAKBEACON_BASE_URL` (no credentials — the page
  is reachable unauthenticated).
- The theme-toggle spec requires `STREAKBEACON_BASE_URL` + the seeded
  credentials because AND-5562 places the control on an authenticated surface.
- AGENTS.md checks executed in this card:
  - `npm install` — see result comment on AND-5567.
  - `npm test` (no env supplied) — expected to skip the new specs; logged in
    the result comment.
  - `npm run lint` / format — AGENTS.md flags these as missing in this repo;
    not run.

## Once the deploy URL lands

- Pin the URL on AND-5288 / individual cards (`deploy_url`).
- Re-run `npm test` with `STREAKBEACON_BASE_URL=...` and seeded credentials.
- Promote AND-5567 outcomes (pass/fail per scenario) back to AND-5561 / AND-5562
  on a follow-up QA pass.
