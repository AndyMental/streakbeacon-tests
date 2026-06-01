Feature: Visual regression baselines
  As a StreakBeacon release owner
  I want visual baselines for the streak grid and settings surfaces
  So that visible regressions are caught before a deployed release is promoted

  Background:
    Given the deployed StreakBeacon app is available
    And the user can reach the dashboard through browser-visible UI

  @critical @dashboard @visual
  Scenario: Streak grid matches the light mode baseline
    Given the user is viewing StreakBeacon in light mode
    When the user opens the dashboard
    Then the streak grid view matches the light mode visual baseline

  @critical @dashboard @visual
  Scenario: Streak grid matches the dark mode baseline
    Given the user is viewing StreakBeacon in dark mode
    When the user opens the dashboard
    Then the streak grid view matches the dark mode visual baseline

  @critical @settings @visual
  Scenario: Settings matches the light mode baseline
    Given the user is viewing StreakBeacon in light mode
    When the user opens the settings surface
    Then the settings view matches the light mode visual baseline

  @critical @settings @visual
  Scenario: Settings matches the dark mode baseline
    Given the user is viewing StreakBeacon in dark mode
    When the user opens the settings surface
    Then the settings view matches the dark mode visual baseline
