Feature: Dashboard habit deletion
  As a local-first StreakBeacon user with an existing habit
  I want to delete a habit I no longer track
  So that it is removed from my habits list and streak grid

  @critical @dashboard
  Scenario: User deletes an existing habit and it disappears from the dashboard
    Given the local StreakBeacon store contains a habit named "Read"
    When the user confirms deletion from the Delete habit control for "Read"
    Then the habits list no longer shows a habit named "Read"
    And the streak grid no longer shows a row for "Read"

  @critical @dashboard
  Scenario: User deletes a selected streak habit and clears the selection
    Given the local StreakBeacon store contains a habit named "Read"
    And the streak grid has "Read" selected
    When the user confirms deletion from the Delete habit control for "Read"
    Then the streak grid no longer shows a selected row for "Read"
    And the dashboard returns to the empty or next available habit state
