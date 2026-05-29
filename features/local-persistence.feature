Feature: Local data persistence
  As a local-first StreakBeacon user
  I want my habits and streak marks to survive browser reloads
  So that the dashboard remains useful without an account

  @smoke @critical @dashboard
  Scenario: User sees saved habits after reload
    Given the local StreakBeacon store contains a habit named "Read"
    And today's grid cell for "Read" is completed
    When the user reloads the dashboard
    Then the habits list shows a habit named "Read"
    And today's grid cell for "Read" is shown as completed
