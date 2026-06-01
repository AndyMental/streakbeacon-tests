Feature: All Habits cumulative grid
  As a StreakBeacon user tracking multiple habits
  I want the All Habits view to summarize completion across habits
  So that I can understand daily progress without opening each habit

  @critical @dashboard @and-6284
  Scenario: User selects the cumulative All Habits grid
    Given the local StreakBeacon store contains habits named "Read", "Run", and "Meditate"
    And each habit has completed days in the current grid window
    When the user opens the All Habits view
    And the user selects the cumulative grid option
    Then the All Habits grid shows one cumulative row for all tracked habits
    And each visible day summarizes completion across "Read", "Run", and "Meditate"
    And the selected cumulative grid option remains visible

  @critical @dashboard @and-6284
  Scenario: User sees the All Habits empty state when no habits exist
    Given the local StreakBeacon store contains no habits
    When the user opens the All Habits view
    Then the All Habits view shows a no-habits message
    And the cumulative grid is not shown
    And the user can reach the create-habit action from the empty state

  @critical @dashboard @and-6285
  Scenario: Single habit cumulative days use binary intensity
    Given the local StreakBeacon store contains only a habit named "Read"
    And "Read" is completed on Monday and open on Tuesday
    When the user opens the All Habits view
    And the user selects the cumulative grid option
    Then Monday is shown at the completed intensity
    And Tuesday is shown at the open intensity
    And no partial intensity is shown for either day

  @critical @dashboard @and-6285
  Scenario: Multiple habit cumulative days use scaled real intensity
    Given the local StreakBeacon store contains habits named "Read", "Run", "Meditate", and "Journal"
    And Monday has 1 of 4 habits completed
    And Tuesday has 2 of 4 habits completed
    And Wednesday has 4 of 4 habits completed
    When the user opens the All Habits view
    And the user selects the cumulative grid option
    Then Monday shows the lowest non-empty cumulative intensity
    And Tuesday shows a stronger cumulative intensity than Monday
    And Wednesday shows the completed intensity
    And each cumulative day exposes its completed-habit count to the user

  @critical @mobile @dashboard @and-6286
  Scenario: Mobile user selects a cumulative grid day without horizontal overflow
    Given the browser viewport is 320 pixels wide
    And the local StreakBeacon store contains habits named "Read", "Run", and "Meditate"
    And today has 2 of 3 habits completed
    When the user opens the All Habits view
    And the user selects the cumulative grid option
    And the user taps today's cumulative grid cell
    Then today's cumulative grid cell is selected
    And the selected day details show that 2 of 3 habits are completed
    And the All Habits controls remain reachable without horizontal scrolling
