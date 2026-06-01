# Step definitions deferred until deploy URL is available (gated on AND-5432).
Feature: Dashboard keyboard navigation accessibility
  As a keyboard-only StreakBeacon user
  I want to traverse, focus, dismiss, and submit on the dashboard with the keyboard alone
  So that I can use the deployed app without a pointing device
  # AND-5288: Tab order must visit interactive controls in DOM order without landing on hidden or decorative nodes.

  @a11y @keyboard
  Scenario: Tab traversal visits dashboard interactive controls in DOM order
    Given the user has loaded the deployed StreakBeacon dashboard
    And keyboard focus is on the first interactive element after the skip link
    When the user presses Tab repeatedly across the dashboard
    Then each focus stop lands on a visible interactive element
    And the focus stops follow the DOM order of the dashboard controls
    And no focus stop lands on a hidden or non-interactive element
  # AND-5288: Every interactive element must show a visible focus indicator when focused via keyboard.

  @a11y @keyboard
  Scenario: Focused interactive elements show a visible focus indicator
    Given the user has loaded the deployed StreakBeacon dashboard
    When the user moves keyboard focus to each interactive element in turn
    Then the focused button shows a visible focus indicator
    And the focused input shows a visible focus indicator
    And the focused link shows a visible focus indicator
  # AND-5553: Destructive confirmation surface is the shadcn AlertDialog with role=alertdialog and Escape-to-dismiss.

  @a11y @keyboard
  Scenario: Escape closes the destructive confirmation dialog
    Given the user has opened the Reset all data confirmation dialog from the StreakBeacon settings panel
    And the confirmation dialog has keyboard focus
    When the user presses Escape
    Then the confirmation dialog is no longer shown
    And the tracked habits remain in StreakBeacon
    And keyboard focus returns to the control that opened the dialog
  # AND-5288: Habit name input on the dashboard must submit with Enter when focused, without requiring pointer activation of the Add habit control.

  @a11y @keyboard
  Scenario: Enter on the focused habit name field submits the new habit
    Given the user is on the StreakBeacon dashboard with no habits
    And keyboard focus is on the Habit name field
    When the user types "Read" into the Habit name field
    And the user presses Enter
    Then the habits list shows a habit named "Read"
    And the habit row for "Read" shows a current streak count of 0
