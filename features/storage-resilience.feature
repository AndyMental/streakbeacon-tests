Feature: Storage resilience
  As a local-first StreakBeacon user
  I want clear recovery paths when browser storage is unavailable or unreadable
  So that storage failures do not silently corrupt or hide my tracking data

  @critical @dashboard
  Scenario: User sees a recovery path for unreadable saved data
    Given the local StreakBeacon store contains unreadable saved data
    When the user opens the StreakBeacon dashboard
    Then the dashboard shows a storage recovery message
    And the dashboard offers a Reset local data control

  @critical @dashboard
  Scenario: User clears unreadable saved data and returns to the dashboard
    Given the user is on the StreakBeacon dashboard with a storage recovery message
    When the user activates the Reset local data control
    Then the dashboard shows an empty habits message
    And the storage recovery message is no longer shown

  @critical @dashboard
  Scenario: User sees a save failure without losing visible habits
    Given the local StreakBeacon store contains a habit named "Read"
    And browser storage cannot accept new saved data
    When the user submits "Run" through the Habit name field and Add habit control
    Then the dashboard shows a storage error message
    And the habits list still shows a habit named "Read"
