Feature: Home and settings responsive state regressions
  As a seeded StreakBeacon user on narrow mobile viewports
  I want the home Today card and settings Data stats to render readable, complete states
  So that empty, loading, error, and small-screen views do not clip or mislead

  Background:
    Given the seeded user opens the deployed StreakBeacon site

  Scenario: Home shows an empty state when no habits exist
    Given the signed-in user has no tracked habits
    When the user lands on the home page
    Then the Today card shows a visible empty state inviting the user to add a habit
    And the Today card does not display placeholder or demo habit names

  Scenario: Home shows a loading skeleton before user data is ready
    When the user first lands on the home page after sign-in
    Then a loading skeleton is visible on the Today card and streak grid
    And the skeleton is replaced by the user's real data once loading completes
    And the visible content does not flip from demo data to user data after first paint

  Scenario: Home shows a destructive error when streak data fails to load
    Given the signed-in user's stored streak data cannot be read
    When the user lands on the home page
    Then a destructive error alert is visible on the Today card
    And the alert describes the read failure in plain language

  Scenario Outline: Settings Data stats do not clip on narrow viewports
    Given the signed-in user has accumulated 3-digit item, day, and window counts
    When the user opens the settings panel at viewport width <width> pixels
    Then each Data stat box shows its full numeric value without clipping
    And each Data stat label is fully visible without truncation

    Examples:
      | width |
      | 320   |
      | 360   |
      | 414   |

  Scenario Outline: Today card status badges remain readable on small screens
    Given the signed-in user has at least one habit with a status badge today
    When the user views the home page at viewport width <width> pixels
    Then the Today card status badges are fully visible
    And the badge text is not clipped, truncated, or overlapping adjacent content

    Examples:
      | width |
      | 320   |
      | 360   |
      | 414   |
      | 768   |

  # Validation gates (per streakbeacon-tests AGENTS.md Gherkin Gate)
  # - User-observable capability: home empty/loading/error and narrow-viewport readability.
  # - Black-box steps: viewport widths, visible UI, no component or class names.
  # - Assertions tied to what a user sees in the deployed browser.
  # - Known dependencies called out: AND-5183 product fix parked behind AND-4746;
  #   automation requires STREAKBEACON_BASE_URL plus a seeded account that can be
  #   placed into empty, loading, error, and 3-digit-count states on the deployed site.
