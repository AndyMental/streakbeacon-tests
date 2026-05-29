# AND-5739 Gherkin Validation Notes

## Scope

This packet covers the local-first StreakBeacon MVP web interactions from AND-5288. Scenarios use public, black-box affordances: visible dashboard text, role/name style controls such as Add habit, Edit habit, Delete habit, Mark today, Unmark today, Export JSON, Confirm import, and Reset all data. Automation should prefer accessible roles, labels, and visible row names before any implementation-specific selector.

Backend API coverage is not applicable for the local-first MVP unless a future PRD or repo handoff introduces a documented public backend API contract.

## PRD Coverage Map

| PRD interaction | Feature scenario |
| --- | --- |
| First-run empty dashboard | `features/create-habit.feature` - First-run dashboard shows an empty state |
| Add habit | `features/create-habit.feature` - User adds a first habit and sees a zero streak |
| Edit habit | `features/edit-habit.feature` - User edits a habit name |
| Delete habit | `features/delete-habit.feature` - User deletes an existing habit and it disappears from the dashboard |
| Delete selected-streak habit | `features/delete-habit.feature` - User deletes a selected streak habit and clears the selection |
| Mark today | `features/today-streak-completion.feature` - User marks today's habit complete |
| Unmark today | `features/today-streak-completion.feature` - User unmarks today's completed habit |
| Multi-day mark | `features/streak-grid-interactions.feature` - User marks multiple days complete from the grid |
| Multi-day unmark | `features/streak-grid-interactions.feature` - User unmarks multiple completed days from the grid |
| Streak grid summary | `features/dashboard-streak-grid-render.feature` - Habit with 7 contiguous marked days shows a filled recent-history row |
| Current/best streak summary | `features/dashboard-streak-grid-render.feature` - Habit summary separates current and best streaks |
| Weekly overview | `features/weekly-overview.feature` - User sees this week's completion overview |
| Theme persistence | `features/settings-panel.feature` - User changes the theme and keeps it after reload |
| Export JSON | `features/settings-panel.feature` - User exports tracked data as JSON |
| Import valid JSON | `features/settings-panel.feature` - User previews a valid JSON import; User confirms a valid JSON import |
| Import invalid JSON rejection | `features/settings-panel.feature` - User sees invalid JSON import rejected |
| Reset all data confirm | `features/settings-panel.feature` - User resets all local data after confirmation |
| Reset all data cancel | `features/settings-panel.feature` - User cancels reset all local data |
| Persistence after reload | `features/local-persistence.feature` - User sees saved habits after reload |
| 404 path | `features/not-found-page.feature` - Visitor opens an unknown route; Visitor returns home from the not found page |
| Error-boundary reset path | `features/app-shell-resilience.feature` - User can recover from an error fallback; User retries after an error fallback |
| Backend API coverage | `features/backend-api-contract.feature` - Local-first MVP has no backend API coverage |

## Validation Signpost

QA validation for determinism and house-style phrasing is complete for this packet. Jyro should validate that each scenario maps to an approved AND-5288 PRD requirement before Playwright automation is expanded.
