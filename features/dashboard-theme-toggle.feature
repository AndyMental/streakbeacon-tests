Feature: Dashboard theme toggle
  As a signed-in StreakBeacon user
  I want a visible dark/light theme toggle on the dashboard surface
  So that I can switch and persist my preferred appearance

  # Jyro validation required: confirm whether AND-5562 places the toggle in the
  # dashboard header or the settings panel before automation hard-codes a path.
  # The black-box spec probes both locations and only fails when neither exposes
  # the documented selector or accessible name.

  @critical @theme
  Scenario: Signed-in user toggles the dashboard theme
    Given a signed-in seeded StreakBeacon user is on the dashboard
    When the user activates the theme toggle
    Then the active theme on the document changes
    And the dashboard remains usable without a page navigation

  @critical @theme
  Scenario: Theme choice persists across reload
    Given the signed-in user has switched the theme from the dashboard
    When the user reloads the dashboard
    Then the previously selected theme is still active
