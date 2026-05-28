Feature: Delete a habit from the StreakBeacon dashboard
  As a seeded StreakBeacon user with an existing habit
  I want to delete a habit I no longer track
  So that it is removed from my habits list and streak grid

  @smoke @dashboard
  Scenario: User deletes an existing habit and it disappears from the dashboard
    Given a logged-in seeded user has a habit named "Read"
    When the user deletes the habit named "Read" from the dashboard
    Then the habits list no longer shows a habit named "Read"
    And the streak grid no longer shows a row for "Read"
