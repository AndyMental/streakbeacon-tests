Feature: Weekly overview
  As a StreakBeacon user reviewing recent progress
  I want a weekly overview of completed and open days
  So that I can understand this week's consistency quickly

  @critical @dashboard
  Scenario: User sees a 7-day weekly overview for an active habit
    Given the local StreakBeacon store contains a habit named "Read"
    And the habit has 4 completed days in the last 7 days ending today
    When the user opens the weekly overview
    Then the weekly overview row for "Read" shows 4 completed days
    And the weekly overview row for "Read" shows 3 open days

  @dashboard
  Scenario: User sees open days in the weekly overview
    Given the local StreakBeacon store contains a habit named "Read"
    And the habit has no completed days in the last 7 days ending today
    When the user opens the weekly overview
    Then the weekly overview row for "Read" shows 7 open days
    But the weekly overview row for "Read" shows no completed days

  @critical @dashboard
  Scenario: User sees only active habits in the weekly overview
    Given the local StreakBeacon store contains an active habit named "Read"
    And the local StreakBeacon store contains an archived habit named "Stretch"
    When the user opens the weekly overview
    Then the weekly overview shows a row for "Read"
    But the weekly overview does not show a row for "Stretch"

  @dashboard
  Scenario: User sees the current week after today's completion changes
    Given the local StreakBeacon store contains an open habit named "Read" for today
    When the user activates the Mark today control for "Read"
    Then the weekly overview shows today as completed
    And the weekly completion count increases by 1

  @a11y @dashboard
  Scenario: Screen reader user hears each weekly overview cell status
    Given the local StreakBeacon store contains a habit named "Read"
    And the habit has today completed and yesterday open
    When the user opens the weekly overview
    Then the weekly overview cell for "Read" today is named with habit, day, and "Completed"
    And the weekly overview cell for "Read" yesterday is named with habit, day, and "Open"

  @dashboard
  Scenario: User sees no weekly overview when no active habits exist
    Given the local StreakBeacon store contains no active habits
    When the user opens the dashboard
    Then the weekly overview is not shown
