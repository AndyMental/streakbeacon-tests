Feature: Streak grid summary
  As a local-first StreakBeacon user with marked habit history
  I want the dashboard streak grid to show my recent completed days
  So that I can confirm my current streak at a glance

  @smoke @critical @dashboard
  Scenario: Habit with 7 contiguous marked days shows a filled recent-history row
    Given the local StreakBeacon store contains a habit named "Read"
    And the habit has 7 contiguous marked days ending today
    When the user opens the dashboard
    Then the streak grid row for "Read" shows 7 completed days ending today
    And the habit row for "Read" shows a current streak count of 7

  @critical @dashboard
  Scenario: Habit summary separates current and best streaks
    Given the local StreakBeacon store contains a habit named "Read"
    And the habit has a best streak of 5 days and a current streak of 2 days
    When the user opens the dashboard
    Then the habit row for "Read" shows a current streak count of 2
    And the habit row for "Read" shows a best streak count of 5
