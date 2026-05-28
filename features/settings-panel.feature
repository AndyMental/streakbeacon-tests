Feature: Settings panel
  As a StreakBeacon user managing local data
  I want settings for appearance, backup, restore, and reset
  So that I can control my tracking experience without losing data unexpectedly

  # Jyro validation required: confirm default theme and persistence wording before automation.
  @critical @settings
  Scenario: User changes the theme setting
    Given the user is on the StreakBeacon settings panel
    When the user changes the theme setting
    Then the selected theme is visibly active
    And the theme remains active after the page reloads

  @critical @settings
  Scenario: User exports a backup
    Given the user is on the StreakBeacon settings panel with tracked habit data
    When the user exports a backup
    Then the browser downloads a StreakBeacon backup file
    And the settings panel shows the export succeeded

  @critical @settings
  Scenario: User previews an imported backup
    Given the user is on the StreakBeacon settings panel
    When the user chooses a valid StreakBeacon backup file
    Then the settings panel shows an import preview
    And the current data is not replaced yet

  @critical @settings
  Scenario: User confirms an imported backup
    Given the user has previewed a valid StreakBeacon backup file
    When the user confirms the import
    Then the imported habits appear in StreakBeacon
    And the settings panel shows the import succeeded

  @settings
  Scenario: User cancels an imported backup
    Given the user has previewed a valid StreakBeacon backup file
    When the user cancels the import
    Then the original habits remain in StreakBeacon
    And the import preview is no longer shown

  @critical @settings
  Scenario: User resets all local data after confirmation
    Given the user is on the StreakBeacon settings panel with tracked habit data
    When the user confirms a reset of all local data
    Then the tracked habits are removed from StreakBeacon
    And the settings panel shows the reset succeeded
