Feature: List streaks API
  As a StreakBeacon API consumer
  I want to retrieve saved streaks
  So that a client can render the current tracking state

  Background:
    Given the public StreakBeacon API is available

  @critical @api
  Scenario: Return an empty streak list
    Given no streaks exist for the API client
    When the client sends a GET request to "/api/streaks"
    Then the response status is 200
    And the response body is a JSON array with 0 streaks

  @critical @api
  Scenario: Return all existing streaks
    Given a streak named "Read" exists through the public API
    And a streak named "Exercise" exists through the public API
    When the client sends a GET request to "/api/streaks"
    Then the response status is 200
    And the response body includes streaks named "Read" and "Exercise"

