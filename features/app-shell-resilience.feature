Feature: App shell resilience
  As a StreakBeacon user navigating the deployed app
  I want loading, error recovery, and keyboard bypass affordances
  So that I can keep using the app when content is delayed or navigation fails

  # AND-5572: Automation requires an observable loading affordance exposed as role=status with an accessible name such as "Loading StreakBeacon".
  @critical @a11y
  Scenario: User sees loading status while app content is pending
    Given the deployed StreakBeacon app has delayed content available to load
    When the user opens the delayed app view
    Then the page shows a loading status for StreakBeacon
    And the loading status does not trap keyboard focus

  # AND-5571: Automation requires the fallback to expose role=alert and a reset control with an accessible name such as "Try again" or "Reset".
  @critical @a11y
  Scenario: User can recover from an error fallback
    Given the deployed StreakBeacon app has an app view that can show an error fallback
    When the user opens the failing app view
    Then the page shows an error alert for StreakBeacon
    And the page offers a reset control

  @critical
  Scenario: User retries after an error fallback
    Given the user is on a StreakBeacon error fallback with a reset control
    When the user activates the reset control
    Then the app view reloads from the deployed site
    And the error alert is no longer shown after recovery succeeds

  # AND-5574: Automation requires the first tabbable control to be a "Skip to main content" link targeting the page's main landmark.
  @smoke @critical @a11y
  Scenario: Keyboard user skips directly to main content
    Given the deployed StreakBeacon app is loaded
    When the user presses Tab once
    Then the skip link to main content has keyboard focus

  @critical @a11y
  Scenario: Keyboard user activates the skip link
    Given the skip link to main content has keyboard focus
    When the user activates the skip link
    Then keyboard focus moves to the main content landmark
    And the browser location references the main content target
