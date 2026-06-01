Feature: All Habits discovery
  As a StreakBeacon user with several tracked habits
  I want to review and filter every habit from one view
  So that I can find the habit I need without scanning the full dashboard

  @smoke @critical @dashboard
  Scenario: User sees every tracked habit in the All Habits grid
    Given the local StreakBeacon store contains habits named "Read", "Run", and "Meditate"
    When the user opens the All Habits view
    Then the All Habits grid shows habit rows for "Read", "Run", and "Meditate"
    And each habit row shows its current streak summary

  @critical @dashboard
  Scenario: User filters the All Habits grid by habit name
    Given the local StreakBeacon store contains habits named "Read", "Run", and "Meditate"
    When the user enters "Run" in the habit search field
    Then the All Habits grid shows the habit row for "Run"
    And the All Habits grid does not show habit rows for "Read" or "Meditate"

  @critical @dashboard
  Scenario: User clears the habit search filter
    Given the All Habits grid is filtered to a habit named "Run"
    When the user clears the habit search field
    Then the All Habits grid shows habit rows for "Read", "Run", and "Meditate"
    And the search field is empty
