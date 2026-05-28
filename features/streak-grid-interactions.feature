Feature: Streak grid interactions
  As a StreakBeacon user reviewing habit history
  I want to select days and toggle completion from the grid
  So that the grid accurately reflects my progress

  # Jyro validation required: confirm the default selected day on first dashboard load.
  @critical @dashboard
  Scenario: User selects a previous day in the streak grid
    Given a logged-in seeded user has a habit named "Read"
    And the habit has an open day yesterday
    When the user selects yesterday in the streak grid
    Then the dashboard shows yesterday as the selected day
    And the selected-day action is available for "Read"

  @critical @dashboard
  Scenario: User marks a selected day complete from the grid
    Given a logged-in seeded user has a habit named "Read"
    And yesterday is selected and open for "Read"
    When the user marks the selected day complete
    Then yesterday appears completed in the streak grid
    And the dashboard streak summary updates for "Read"

  @critical @dashboard
  Scenario: User marks a selected day open from the grid
    Given a logged-in seeded user has a habit named "Read"
    And yesterday is selected and completed for "Read"
    When the user marks the selected day open
    Then yesterday appears open in the streak grid
    And the dashboard streak summary updates for "Read"

  # Jyro validation required: confirm multi-habit switching remains in MVP if no seeded auth exists.
  @dashboard
  Scenario: User switches between tracked habits
    Given a logged-in seeded user has habits named "Read" and "Walk"
    When the user switches the dashboard to "Walk"
    Then the streak grid shows the row for "Walk"
    And the dashboard streak summary is for "Walk"
