Feature: Today streak completion
  As a local-first StreakBeacon user
  I want to mark and unmark today's habit completion
  So that today's streak state matches what I actually did

  @smoke @critical @dashboard
  Scenario: User marks today's habit complete
    Given the local StreakBeacon store contains an open habit named "Read" for today
    When the user activates the Mark today control for "Read"
    Then today's grid cell for "Read" is shown as completed
    And the habit row for "Read" shows a current streak count of 1

  @critical @dashboard
  Scenario: User unmarks today's completed habit
    Given the local StreakBeacon store contains a completed habit named "Read" for today
    When the user activates the Unmark today control for "Read"
    Then today's grid cell for "Read" is shown as open
    And the habit row for "Read" shows a current streak count of 0
