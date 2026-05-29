Feature: Backend API contract
  As a QA owner for StreakBeacon MVP
  I want the public API surface to match the product contract
  So that backend behavior is either covered or explicitly out of scope

  # Jyro validation required: confirm the MVP has no public backend API before Playwright/API automation begins.
  @critical @api
  Scenario: Local-first MVP has no backend API coverage
    Given the StreakBeacon MVP is defined as local-first with no public backend API
    When QA maps PRD coverage for backend API workflows
    Then backend API coverage is recorded as not applicable for the MVP
    And no API-specific automation is created

  # Jyro validation required: replace this scenario if a sync/auth API becomes part of MVP scope.
  @api
  Scenario: API automation waits for a documented public contract
    Given no public StreakBeacon API contract has been approved
    When QA prepares backend API automation
    Then automation remains blocked on a documented API contract
    And the blocker is reported against AND-5288
