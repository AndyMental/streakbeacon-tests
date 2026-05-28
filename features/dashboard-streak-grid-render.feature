Feature: Streak grid renders a habit's recent history
  As a seeded StreakBeacon user with marked habit history
  I want the dashboard streak grid to show my recent completed days
  So that I can confirm my current streak at a glance

  @smoke @dashboard
  Scenario: Habit with 7 contiguous marked days shows a filled recent-history row
    Given a logged-in seeded user has a habit named "Read"
    And the habit has 7 contiguous marked days ending today
    When the user opens the dashboard
    Then the end of the habit's streak-grid row shows 7 filled #27AE60 green cells
    And the dashboard shows current streak count "7" for the habit
