Feature: Weekly overview
  As a StreakBeacon user reviewing recent progress
  I want a weekly overview of completed and open days
  So that I can understand this week's consistency quickly

  @critical @dashboard
  Scenario: User sees this week's completion overview
    Given the local StreakBeacon store contains a habit named "Read"
    And the habit has 4 completed days in the current week
    When the user opens the weekly overview
    Then the weekly overview shows 4 completed days
    And the weekly overview shows the remaining days as open

  @dashboard
  Scenario: User sees the current week after today's completion changes
    Given the local StreakBeacon store contains an open habit named "Read" for today
    When the user activates the Mark today control for "Read"
    Then the weekly overview shows today as completed
    And the weekly completion count increases by 1
