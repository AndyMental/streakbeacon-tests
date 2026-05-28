Feature: Backend API contract
  As a QA owner for StreakBeacon MVP
  I want the public API surface to match the product contract
  So that backend behavior is either covered or explicitly out of scope

  # Jyro validation required: confirm the MVP has no public backend API before Playwright/API automation begins.
  @critical @api
  Scenario: MVP exposes no public backend API workflow
    Given the StreakBeacon MVP is defined as local-first with no public backend API
    When the user completes habit tracking from the deployed site
    Then the workflow succeeds without calling a documented backend API
    And no API-specific test credentials are required

  # Jyro validation required: replace this scenario if a sync/auth API becomes part of MVP scope.
  @api
  Scenario: API automation waits for a documented public contract
    Given no public StreakBeacon API contract has been approved
    When QA prepares backend API automation
    Then automation remains blocked on a documented API contract
    And the blocker is reported against AND-5288
