Feature: Not found page
  As a visitor who opens an invalid StreakBeacon URL
  I want a branded not found page with a way back home
  So that I can recover from a broken link

  @smoke @critical
  Scenario: Visitor opens an unknown route
    Given the visitor has no required account session
    When the visitor opens an unknown StreakBeacon route
    Then the page shows a branded not found message
    And the page offers a link back to the home page

  @critical
  Scenario: Visitor returns home from the not found page
    Given the visitor is on the StreakBeacon not found page
    When the visitor follows the home page link
    Then the StreakBeacon home page is shown
