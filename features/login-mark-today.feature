Feature: Mark today's streak day
  As a seeded StreakBeacon user
  I want to mark today's streak day
  So that the streak grid records my progress for today

  @smoke @critical
  Scenario: Seeded user marks today's streak day from the deployed site
    Given the seeded user is signed in on the deployed StreakBeacon site
    When the user marks today's streak day
    Then the streak grid shows today as marked
