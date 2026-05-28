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

  @critical @dashboard
  Scenario: Habit with a missed day shows a break in the recent-history row
    Given a logged-in seeded user has a habit named "Read"
    And the habit has marked days for today and two days ago
    And the habit has no marked day for yesterday
    When the user opens the dashboard
    Then the habit's streak-grid row shows yesterday as an unfilled cell
    And the dashboard shows current streak count "1" for the habit

  @critical @dashboard
  Scenario: Habit with no marked days shows an empty recent-history row
    Given a logged-in seeded user has a habit named "Read"
    And the habit has no marked days in the visible streak-grid range
    When the user opens the dashboard
    Then the habit's streak-grid row shows only unfilled cells
    And the dashboard shows current streak count "0" for the habit
