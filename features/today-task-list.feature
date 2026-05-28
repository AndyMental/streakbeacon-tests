Feature: Today's task list
  As a StreakBeacon user planning today's habits
  I want to add and complete today's tasks from the home page
  So that my daily plan and streak progress stay aligned

  # Jyro validation required: confirm whether "task" and "habit" are the same MVP item type.
  @critical @home
  Scenario: User adds a task to today's list
    Given the user is on the StreakBeacon home page with at least one task already visible
    When the user submits a new task named "Read for 20 minutes"
    Then today's task list shows "Read for 20 minutes"
    And the new task is shown as not completed

  # Jyro validation required: confirm the visible wording for completed vs open task state.
  @critical @home
  Scenario: User marks an open task complete
    Given today's task list includes an open task named "Read for 20 minutes"
    When the user marks "Read for 20 minutes" complete
    Then today's task list shows "Read for 20 minutes" as completed
    And today's streak summary reflects one completed task

  @critical @home
  Scenario: User reopens a completed task
    Given today's task list includes a completed task named "Read for 20 minutes"
    When the user marks "Read for 20 minutes" open
    Then today's task list shows "Read for 20 minutes" as not completed
    And today's streak summary reflects no completed tasks
