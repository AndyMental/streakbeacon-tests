Feature: Streak grid interactions
  As a StreakBeacon user reviewing habit history
  I want to select days and toggle completion from the grid
  So that the grid accurately reflects my progress

  @critical @dashboard
  Scenario: User selects a previous day in the streak grid
    Given the local StreakBeacon store contains a habit named "Read"
    And yesterday's grid cell for "Read" is open
    When the user selects yesterday's grid cell for "Read"
    Then the dashboard shows yesterday as the selected day
    And the selected-day action is available for "Read"

  @critical @a11y @dashboard
  Scenario: Keyboard user selects a previous day in the streak grid
    Given the local StreakBeacon store contains a habit named "Read"
    And yesterday's grid cell for "Read" is open
    When the user tabs to yesterday's grid cell and presses Enter
    Then the dashboard shows yesterday as the selected day
    And the focused grid cell remains announced as open

  @a11y @dashboard
  Scenario: User reviews a grid day tooltip
    Given the local StreakBeacon store contains a habit named "Read"
    And yesterday's grid cell for "Read" is completed
    When the user hovers over yesterday's grid cell for "Read"
    Then a tooltip identifies yesterday's date and completed status

  @critical @dashboard
  Scenario: User marks a selected day complete from the grid
    Given the local StreakBeacon store contains a habit named "Read"
    And yesterday's grid cell for "Read" is selected and open
    When the user activates the Mark selected day control
    Then yesterday appears completed in the streak grid
    And the dashboard streak summary updates for "Read"

  @critical @dashboard
  Scenario: User marks a selected day open from the grid
    Given the local StreakBeacon store contains a habit named "Read"
    And yesterday's grid cell for "Read" is selected and completed
    When the user activates the Unmark selected day control
    Then yesterday appears open in the streak grid
    And the dashboard streak summary updates for "Read"

  @critical @dashboard
  Scenario: User marks multiple days complete from the grid
    Given the local StreakBeacon store contains a habit named "Read"
    And Monday and Tuesday are open grid cells for "Read"
    When the user applies the Mark days action to Monday and Tuesday
    Then Monday and Tuesday appear completed in the streak grid
    And the dashboard streak summary counts both completed days for "Read"

  @critical @dashboard
  Scenario: User unmarks multiple completed days from the grid
    Given the local StreakBeacon store contains a habit named "Read"
    And Monday and Tuesday are completed grid cells for "Read"
    When the user applies the Unmark days action to Monday and Tuesday
    Then Monday and Tuesday appear open in the streak grid
    And the dashboard streak summary removes both completed days for "Read"
