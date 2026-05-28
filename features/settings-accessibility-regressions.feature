Feature: Settings panel accessibility regressions
  As a seeded StreakBeacon user relying on assistive technology or reduced-motion settings
  I want the deployed settings panel to announce status changes and respect motion preferences
  So that theme, import, and reset actions are perceivable and safe to use

  Background:
    Given the seeded user opens the deployed StreakBeacon site
    And the user signs in with approved test credentials
    And the user opens the settings panel

  Scenario: Theme change announces a polite status update
    When the user switches the theme via the visible theme control
    Then a single polite live region announces that the theme preference was saved
    And the status message is not prefixed with a moon icon for non-theme messages

  Scenario: Import preview is announced once and not duplicated
    When the user selects a valid export file in the import control
    Then the import preview panel becomes visible
    And the preview is announced exactly once by a polite live region
    And the preview is not re-announced as an assertive alert

  Scenario: Import error is announced assertively
    When the user selects a file that the site rejects as invalid
    Then a visible import error message appears
    And the error is announced by an assertive live region

  Scenario: Unreadable file surfaces an error instead of a silent failure
    When the user selects a file whose contents cannot be read as text
    Then a visible import error message appears
    And no uncaught error is surfaced in the browser
    And the previously visible preview, if any, is cleared

  Scenario: Reset arming exposes a programmatic state
    When the user activates the reset control once
    Then the reset control reports an armed state programmatically
    And the visible label reflects the armed confirmation step
    When the user activates the reset control a second time
    Then the locally stored streak data is cleared on the deployed site

  Scenario: Reduced motion suppresses transitions
    Given the user has set the operating system preference to reduce motion
    When the user switches the theme via the visible theme control
    And the user toggles any button or toggle group control in settings
    Then no color, theme, or control transition animations play

  # Validation gates (per streakbeacon-tests AGENTS.md Gherkin Gate)
  # - User-observable capability: settings status, import, reset, motion.
  # - Black-box steps: no app source, no DOM internals, no implementation names.
  # - Assertions tied to visible UI, public assistive output, or browser preference behavior.
  # - Known dependencies called out: AND-5182 product fix parked behind AND-4746;
  #   deployed Vercel URL and seeded credentials must be supplied via
  #   STREAKBEACON_BASE_URL / STREAKBEACON_TEST_EMAIL / STREAKBEACON_TEST_PASSWORD
  #   before automation can execute these scenarios.
