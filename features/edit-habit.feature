Feature: Dashboard habit editing
  As a local-first StreakBeacon user with tracked habits
  I want to rename a habit from the dashboard
  So that my habit list stays accurate as my routine changes

  @critical @dashboard
  Scenario: User edits a habit name
    Given the local StreakBeacon store contains a habit named "Read"
    When the user renames "Read" to "Read nightly" through its Edit habit control
    Then the habits list shows a habit named "Read nightly"
    And the habits list no longer shows a habit named "Read"
