Feature: Mark today's streak day
  As a StreakBeacon visitor
  I want to mark today's streak day
  So that the streak grid records my progress for today

  # StreakBeacon is local-first with no authentication surface (per AND-5634 /
  # AND-5288). The "seeded sign-in" precondition this scenario originally used
  # does not exist on the product. The scenario below is the updated black-box
  # intent and is pending Gherkin re-validation (coordinate with Jyro) and a
  # spec rewrite before automation can run; the existing spec is suite-skipped.

  @smoke @critical @pending-rewrite
  Scenario: Visitor marks today's streak day from the deployed site
    Given the visitor opens the deployed StreakBeacon site in a fresh browser
    And a habit is available to mark for today through the public first-run UI
    When the visitor marks today's streak day
    Then the streak grid shows today as marked
