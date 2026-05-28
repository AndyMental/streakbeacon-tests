Feature: Create a habit from the StreakBeacon home page
  As a new StreakBeacon user with no habits yet
  I want to add my first habit by name
  So that I can start tracking a streak from day zero

  @smoke @home
  Scenario: User adds a first habit and sees it in the list with a zero streak
    Given the user is on the StreakBeacon home page with no habits
    When the user enters a habit name and submits the new-habit form
    Then the habits list shows the new habit with a streak count of 0
