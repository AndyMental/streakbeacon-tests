Feature: Weekly overview
  As a StreakBeacon user reviewing recent progress
  I want a weekly overview of completed and open days
  So that I can understand this week's consistency quickly

  # Jyro validation required: decide whether this is a distinct UI surface or satisfied by the streak grid.
  @critical @dashboard
  Scenario: User sees this week's completion overview
    Given a logged-in seeded user has completed 4 days this week
    When the user opens the weekly overview
    Then the weekly overview shows 4 completed days
    And the weekly overview shows the remaining days as open

  @dashboard
  Scenario: User sees the current week after today's completion changes
    Given a logged-in seeded user has not completed today's task
    When the user marks today's task complete
    Then the weekly overview shows today as completed
    And the weekly completion count increases by 1
