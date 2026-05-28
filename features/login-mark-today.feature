Feature: Mark today's streak day
  As a seeded StreakBeacon user
  I want to sign in and mark today's streak day
  So that the streak grid records my progress for today

  Scenario: Seeded user marks today's streak day from the deployed site
    Given the seeded user opens the deployed StreakBeacon site
    When the user signs in with approved test credentials
    And the user marks today's streak day
    Then the streak grid shows today as marked
