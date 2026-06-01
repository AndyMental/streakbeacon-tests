Feature: Create streak API
  As a StreakBeacon API consumer
  I want to create a streak
  So that a client can start tracking a new habit

  Background:
    Given the public StreakBeacon API is available

  @critical @api
  Scenario: Create a streak with a valid name
    Given no streak named "Read" exists for the API client
    When the client sends a POST request to "/api/streaks" with name "Read"
    Then the response status is 201
    And the response body includes a streak named "Read" with an id

  @critical @api
  Scenario: Reject a streak without a name
    Given the API client has a valid JSON request body without a name
    When the client sends a POST request to "/api/streaks"
    Then the response status is 400
    And the response body explains that name is required

  @api
  Scenario: Reject a duplicate streak name
    Given a streak named "Read" exists through the public API
    When the client sends a POST request to "/api/streaks" with name "Read"
    Then the response status is 409
    And the response body explains that the streak already exists

