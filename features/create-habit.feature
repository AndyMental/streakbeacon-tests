Feature: Dashboard habit creation
  As a local-first StreakBeacon user
  I want to create habits from the dashboard
  So that I can start tracking streaks without account setup

  @smoke @critical @dashboard
  Scenario: First-run dashboard shows an empty state
    Given the local StreakBeacon store contains no habits
    When the user opens the StreakBeacon dashboard
    Then the dashboard shows an empty habits message
    And the dashboard offers an Add habit control

  @smoke @critical @dashboard
  Scenario: User adds a first habit and sees a zero streak
    Given the user is on the StreakBeacon dashboard with no habits
    When the user submits "Read" through the Habit name field and Add habit control
    Then the habits list shows a habit named "Read"
    And the habit row for "Read" shows a current streak count of 0
