# AND-5570 Export / Import / Reset Black-Box Plan

## Scope

This packet maps the StreakBeacon settings-panel surface delivered by [AND-5552](https://github.com/AndyMental/streakbeacon-app/pull/26) (export/import streak data UI) and the destructive reset confirmation work tracked by AND-5553 (reset-all-data shadcn AlertDialog) to deployed-URL black-box coverage.

It defines:

- The Gherkin scenarios in this repo that cover each PRD interaction.
- The public, black-box affordances (accessible roles, names, and stable text) the deployed app must expose so Playwright automation can target them without inspecting application source.
- Test data and environment prerequisites that must be supplied before automation runs against the deployed Vercel URL.
- The Playwright skip / gate convention this packet uses while a deployed URL and approved local-first state strategy are still pending.

This packet is intended for Jyro Gherkin validation and for the StreakBeacon frontend cards (AND-5552, AND-5553) so the implementation exposes the public hooks black-box automation requires.

## PRD Coverage Map

| Implementation card | PRD interaction | Feature scenario |
| --- | --- | --- |
| AND-5552 | Export tracked data as JSON | `features/settings-panel.feature` - User exports tracked data as JSON |
| AND-5552 | Preview a valid JSON import (no destructive replace yet) | `features/settings-panel.feature` - User previews a valid JSON import |
| AND-5552 | Confirm a valid JSON import (data replaced and visible) | `features/settings-panel.feature` - User confirms a valid JSON import |
| AND-5552 | Invalid JSON import rejected, existing data preserved | `features/settings-panel.feature` - User sees invalid JSON import rejected |
| AND-5553 | Reset all data after explicit AlertDialog confirm | `features/settings-panel.feature` - User resets all local data after confirmation |
| AND-5553 | Reset all data dialog cancel leaves data intact | `features/settings-panel.feature` - User cancels reset all local data |

These scenarios stay deliberately black-box: they reference user-visible surfaces (settings panel, Export JSON control, import preview, import error, Reset all data dialog) and do not mention shadcn components, storage adapter details, or app source.

## Required Public Hooks

Implementation must expose the following accessible names and roles so black-box automation can target them without inspecting source. Stable `data-testid` values are acceptable as a secondary hook, but the accessible name is the primary contract.

### AND-5552 export / import (settings panel)

| Surface | Required public hook | Why automation needs it |
| --- | --- | --- |
| Settings entry point | Visible control with accessible name matching `Settings` reachable from the dashboard. | Lets automation navigate to the settings panel from the dashboard via `getByRole('link'\|'button', { name: /settings/i })`. |
| Settings panel landmark | Settings surface exposed under a heading or landmark with accessible name matching `Settings`. | Lets automation assert the panel is open before interacting. |
| Export control | `button` with accessible name matching `Export JSON` (or `Export streak data`). | Lets `getByRole('button', { name: /export.*json/i })` trigger the download path. |
| Export success affordance | Visible status text or `role="status"` with accessible name matching `Export succeeded` (or equivalent product copy). | Lets automation assert the export path completed without inspecting download internals. |
| Import file picker | `input[type="file"]` reachable via accessible label matching `Import StreakBeacon JSON` or equivalent visible label. | Lets `setInputFiles(...)` provide a fixture file. |
| Import preview affordance | Visible region (`role="region"` or labeled section) with accessible name matching `Import preview`. | Lets automation assert preview state distinct from confirmed import. |
| Confirm import control | `button` with accessible name matching `Confirm import`. | Lets automation move past the preview into a destructive replace step intentionally. |
| Import success affordance | Visible status text or `role="status"` with accessible name matching `Import succeeded`. | Lets automation assert the destructive replace finished. |
| Import error affordance | `role="alert"` with accessible name matching `Import failed` (or equivalent product copy describing invalid JSON). | Lets `getByRole('alert', { name: /import.*failed/i })` assert the rejection path. |
| Imported habit visibility | Imported habits render in the same dashboard habits list automation already targets. | Lets the post-confirm assertion reuse existing habit-row hooks instead of bespoke selectors. |

### AND-5553 reset all data (settings panel)

| Surface | Required public hook | Why automation needs it |
| --- | --- | --- |
| Reset trigger | `button` with accessible name matching `Reset all data` reachable from the settings panel. | Lets automation open the destructive confirmation flow via `getByRole('button', { name: /reset all data/i })`. |
| Reset confirmation dialog | `role="alertdialog"` with accessible name matching `Reset all data?`. | Lets automation distinguish the destructive dialog from other dialogs and gate the destructive step. |
| Confirm destructive action | `button` inside the dialog with accessible name matching `Reset all data` (destructive variant). | Lets `getByRole('button', { name: /reset all data/i })` inside the dialog confirm only after the dialog is open. |
| Cancel control | `button` inside the dialog with accessible name matching `Cancel`. | Lets automation exercise the safe path and assert no data change. |
| Keyboard semantics | Esc cancels, Enter on destructive control confirms, focus returns to the reset trigger on close. | Required by AND-5553 acceptance; automation will assert by sending `Escape` / `Enter` and checking `:focus`. |
| Reset success affordance | Visible status text or `role="status"` with accessible name matching `All data was reset`. | Lets automation assert the destructive replace completed without inspecting storage internals. |
| Post-reset empty state | Dashboard renders the same empty/first-run state covered by `features/create-habit.feature` (`Add habit` control, empty habits message). | Lets post-reset assertions reuse first-run hooks rather than custom selectors. |

If any required hook above is missing on the deployed branch, black-box automation cannot reach the corresponding gate. Implementation cards should keep these accessible names stable across copy updates, or coordinate renames with this plan.

## Test Data and Environment

Required inputs:

| Input | Source | Notes |
| --- | --- | --- |
| `STREAKBEACON_BASE_URL` | Issue metadata key `deploy_url` or release handoff | Deployed Vercel URL only, never localhost or app source. |
| Valid backup JSON fixture | Generated from the same deployed app via the export path before the import scenarios run | Keeps automation honest: the fixture is whatever Export JSON produced on the same deployed branch, not a hand-crafted payload that drifts from the contract. |
| Invalid JSON fixture | Static file checked into `tests/fixtures/` once automation is approved | Any payload the import path is documented to reject (for example, a truncated JSON file or a JSON object missing the required habit shape). Must not contain real user data. |

Tests must not import or read application source to build fixtures or assert behavior. The export round-trip approach is the only sanctioned way to obtain a valid fixture for the deployed branch.

## Playwright Skip / Gate Convention

Until a deployed URL and approved local-first state strategy are supplied, the export/import/reset scenarios in this packet remain non-automated. When the first automation lands it must follow the existing smoke skeleton (`tests/smoke/login-mark-today.spec.ts`):

- Resolve `STREAKBEACON_BASE_URL` (and seeded credentials if the deployed branch requires them) through a `requireEnv` helper.
- Skip the test at the `test.describe` level when any required env value is missing, with a message naming the missing key. The same pattern applies for the export/import/reset specs so a missing deploy URL produces a clear skip rather than a misleading failure.
- Tag the resulting Playwright tests so the existing `@critical` / `@settings` Gherkin tags are reflected in the test title or `test.describe` block, keeping the matrix queryable.
- Do not introduce custom retry or mocking layers; the existing `playwright.config.ts` already defines tracing, screenshot, and video behavior.

This packet does not add Playwright automation in this run because:

- AND-5553 is still blocked before merge, so its reset surface is not yet on a deployed branch.
- No deployed Vercel URL has been supplied via issue metadata `deploy_url` or release handoff for the AND-5552 export/import surface.
- Deterministic local-first data setup (clean store before scenarios, seeded valid backup for import, isolation between scenarios) is not yet approved.

When those three blockers clear, automation can land incrementally without touching this plan.

## Smoke Matrix Cross-Reference

`docs/smoke-test-matrix.md` lists existing smoke scenarios and required accessibility hooks for the app shell. The export/import/reset scenarios from this packet are intentionally tracked here, separate from the smoke matrix, until a deployed URL and state setup strategy are approved. At that point they should be promoted into the smoke matrix with the same columns (Gherkin source, automation status, env prerequisite, pass condition, blocked-until reason).

## Validation Signpost

QA has authored the Gherkin coverage and the required public hooks. Jyro should validate that:

- Each scenario maps to an approved AND-5288 PRD requirement (export, import-valid, import-invalid, reset-confirm, reset-cancel).
- The required public hooks above match the copy the implementation cards (AND-5552, AND-5553) intend to ship.
- The deferred automation strategy (deploy-URL gating, export round-trip fixture, no app-source inspection) is acceptable before any Playwright spec is written.
