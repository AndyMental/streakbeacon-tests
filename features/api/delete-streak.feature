Feature: Delete streak API
  As a StreakBeacon API consumer
  I want to delete a streak by id
  So that a client can remove tracking data that is no longer needed

  Background:
    Given the public StreakBeacon API is available

  @critical @api
  Scenario: Delete an existing streak
    Given a streak named "Read" exists through the public API
    When the client sends a DELETE request to "/api/streaks/{id}" for the "Read" streak
    Then the response status is 204
    And a GET request to "/api/streaks" no longer includes the "Read" streak

  @api
  Scenario: Report a missing streak id
    Given no streak exists with id "missing-streak-id"
    When the client sends a DELETE request to "/api/streaks/missing-streak-id"
    Then the response status is 404
    And the response body explains that the streak was not found

