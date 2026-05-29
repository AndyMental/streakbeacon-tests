Feature: Settings panel
  As a StreakBeacon user managing local data
  I want settings for appearance, backup, restore, and reset
  So that I can control my tracking experience without losing data unexpectedly

  @critical @settings
  Scenario: User changes the theme and keeps it after reload
    Given the user is on the StreakBeacon settings panel
    When the user selects the Dark theme option
    Then the Dark theme option is shown as selected
    And the dashboard remains in dark theme after the page reloads

  @critical @settings
  Scenario: User exports tracked data as JSON
    Given the user is on the StreakBeacon settings panel with tracked habit data
    When the user activates the Export JSON control
    Then the browser downloads a StreakBeacon JSON backup file
    And the settings panel shows the export succeeded

  @critical @settings
  Scenario: User previews a valid JSON import
    Given the user is on the StreakBeacon settings panel
    When the user chooses a valid StreakBeacon JSON backup file
    Then the settings panel shows an import preview
    And the current data is not replaced yet

  @critical @settings
  Scenario: User confirms a valid JSON import
    Given the user has previewed a valid StreakBeacon backup file
    When the user activates the Confirm import control
    Then the imported habits appear in StreakBeacon
    And the settings panel shows the import succeeded

  @critical @settings
  Scenario: User sees invalid JSON import rejected
    Given the user is on the StreakBeacon settings panel with tracked habit data
    When the user chooses an invalid JSON file for import
    Then the settings panel shows an import error
    And the current habits remain unchanged

  @critical @settings
  Scenario: User resets all local data after confirmation
    Given the user is on the StreakBeacon settings panel with tracked habit data
    When the user confirms the Reset all data dialog
    Then the tracked habits are removed from StreakBeacon
    And the settings panel shows the reset succeeded

  @critical @settings
  Scenario: User cancels reset all local data
    Given the user is on the StreakBeacon settings panel with tracked habit data
    When the user cancels the Reset all data dialog
    Then the tracked habits remain in StreakBeacon
    And the settings panel no longer shows the reset confirmation dialog
