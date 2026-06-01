Feature: Backend API contract
  As a QA owner for StreakBeacon MVP
  I want the public API surface to match the product contract
  So that backend behavior is either covered or explicitly out of scope

  # Contract source: AND-6111, based on the API documentation work tracked by AND-6048.
  @critical @api
  Scenario: Documented streak endpoints have Gherkin coverage
    Given the approved API scope includes GET "/api/streaks"
    And the approved API scope includes POST "/api/streaks"
    And the approved API scope includes DELETE "/api/streaks/:id"
    When QA maps backend API workflows
    Then GET "/api/streaks" is covered by the List streaks API feature
    And POST "/api/streaks" is covered by the Create streak API feature
    And DELETE "/api/streaks/:id" is covered by the Delete streak API feature

  @api
  Scenario: Undocumented API routes remain out of automation scope
    Given an API route is not listed in the approved API scope
    When QA prepares backend API automation
    Then no scenario is automated for that route
    And the missing contract is reported against AND-5288
