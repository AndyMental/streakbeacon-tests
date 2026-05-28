Feature: Create a habit from the StreakBeacon home page
  As a new StreakBeacon user with no habits yet
  I want to add my first habit by name
  So that I can start tracking a streak from day zero

  @smoke @home
  Scenario: User adds a first habit and sees it in the list with a zero streak
    Given the user is on the StreakBeacon home page with no habits
    When the user enters a habit name and submits the new-habit form
    Then the habits list shows the new habit with a streak count of 0

  @critical @home
  Scenario: User cannot add a habit without a name
    Given the user is on the StreakBeacon home page with no habits
    When the user submits the new-habit form with a blank name
    Then the habits list remains empty
    And the new-habit form shows a name-required message

  @critical @home
  Scenario: User adds a habit by pressing Enter in the name field
    Given the user is on the StreakBeacon home page with no habits
    When the user enters a habit name and presses Enter in the name field
    Then the habits list shows the new habit with a streak count of 0
