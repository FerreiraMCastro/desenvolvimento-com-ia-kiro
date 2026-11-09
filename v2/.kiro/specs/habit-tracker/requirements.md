# Requirements Document

## Introduction

The Habit_Tracker_App is a client-side web application that lets a user register daily habits and track their completion across a week. It is built with plain HTML, CSS, and JavaScript (no frameworks, no build step, no external dependencies) and runs entirely in the browser. Data persists locally via the browser's `localStorage`. The app presents a weekly table of habits (Sunday to Saturday), lets the user toggle completion marks per day, and shows a statistics panel reflecting the current week. All user-interface labels are in Portuguese, and dates use the Brazilian dd/mm format.

## Glossary

- **Habit_Tracker_App**: The web application described by this document.
- **Habit**: A named activity the user wants to track daily.
- **Mark**: A completion indicator set on a Habit for a specific date.
- **Week**: A consecutive seven-day period running from Sunday to Saturday.
- **Current_Week**: The Week that contains today's date.
- **Navigated_Week**: The Week currently displayed in the Weekly_Table; it may equal or differ from the Current_Week.
- **Weekly_Table**: The table displaying one row per Habit and one column per day of the Week.
- **Stats_Panel**: The statistics area displayed above the Weekly_Table.
- **localStorage**: The browser's local storage, used to persist data across page reloads.

## Requirements

### Requirement 1: Habit Registration and Deletion

**User Story:** As a user, I want to add and remove habits, so that I can manage the set of habits I track.

#### Acceptance Criteria

1. WHEN a user submits a new habit name of 1 to 50 characters, THE Habit_Tracker_App SHALL create a Habit with that name, add it as a new row in the Weekly_Table, and persist the Habit to localStorage.
2. IF a user submits a habit name that is empty or longer than 50 characters, THEN THE Habit_Tracker_App SHALL not create a Habit and SHALL display an error indication that the name is invalid.
3. WHEN a user requests deletion of a Habit, THE Habit_Tracker_App SHALL ask the user to confirm the deletion.
4. IF the user confirms the deletion, THEN THE Habit_Tracker_App SHALL remove the Habit and all of its Marks from the Weekly_Table and persist the removal to localStorage.
5. IF the user cancels the deletion, THEN THE Habit_Tracker_App SHALL keep the Habit and its Marks unchanged.

### Requirement 2: Data Persistence

**User Story:** As a user, I want my habits and marks to persist, so that I do not lose data when I reload the page.

#### Acceptance Criteria

1. WHEN a Habit is added or a Mark is toggled, THE Habit_Tracker_App SHALL store all Habits and Marks in localStorage.
2. WHEN the page is reloaded, THE Habit_Tracker_App SHALL load Habits and Marks from localStorage and display the previous Habits and Marks in the Weekly_Table and Stats_Panel.
3. WHEN the page is loaded and localStorage contains no stored Habits or Marks, THE Habit_Tracker_App SHALL display an empty Weekly_Table and an empty Stats_Panel without displaying an error message.

### Requirement 3: Weekly View

**User Story:** As a user, I want to see my habits across the days of the week and mark them, so that I can track my daily progress.

#### Acceptance Criteria

1. WHEN the app is opened, THE Habit_Tracker_App SHALL set the Navigated_Week to the Current_Week, calculated from today's date, and display it in the Weekly_Table.
2. THE Weekly_Table SHALL display one row per Habit and seven columns ordered from Sunday to Saturday.
3. THE Habit_Tracker_App SHALL display the Navigated_Week's start and end dates above the Weekly_Table in dd/mm format, for example "19/01 - 25/01".
4. THE Habit_Tracker_App SHALL display the Portuguese day abbreviation and the Navigated_Week's date in each column header, for example "Dom 19", using the abbreviations Dom, Seg, Ter, Qua, Qui, Sex, Sab.
5. WHILE the Navigated_Week is the Current_Week, THE Habit_Tracker_App SHALL highlight the column corresponding to today's date.
6. WHEN a user clicks a cell button, THE Habit_Tracker_App SHALL toggle the Mark for that Habit on that day and persist the change.
7. WHEN a user clicks the previous-week arrow, THE Habit_Tracker_App SHALL set the Navigated_Week to the previous Week and display it.
8. WHEN a user clicks the next-week arrow, THE Habit_Tracker_App SHALL set the Navigated_Week to the next Week and display it.
9. WHEN a user clicks the "Hoje" (Today) button, THE Habit_Tracker_App SHALL set the Navigated_Week to the Current_Week and display it.
10. WHEN a Week is displayed, THE Weekly_Table SHALL show in each cell the Mark state for the corresponding Habit and day, reflecting the persisted data for the Navigated_Week.
11. THE Habit_Tracker_App SHALL disable the cell buttons for any day whose date is after today's date, preventing the user from toggling Marks on future days.

### Requirement 4: Statistics Panel

**User Story:** As a user, I want to see summary statistics, so that I can gauge my overall progress.

#### Acceptance Criteria

1. THE Habit_Tracker_App SHALL display the total number of registered Habits in the Stats_Panel.
2. THE Habit_Tracker_App SHALL display in the Stats_Panel the count of Habits marked on today's date.
3. THE Habit_Tracker_App SHALL display in the Stats_Panel the percentage of Habits marked on today's date, computed as the number of Habits marked on today's date divided by the total number of registered Habits, multiplied by 100, displayed as a whole number rounded to the nearest integer.
4. THE Habit_Tracker_App SHALL display in the Stats_Panel the percentage of Current_Week completion, computed as the number of marked cells in the Current_Week divided by the product of the number of Habits and 7, multiplied by 100, displayed as a whole number rounded to the nearest integer.
5. WHERE the Navigated_Week differs from the Current_Week, THE Habit_Tracker_App SHALL compute the Stats_Panel statistics from the Current_Week.
6. IF no Habits are registered, THEN THE Habit_Tracker_App SHALL display zero for all counts and percentages in the Stats_Panel.
7. IF one or more Habits are registered but no Habits are marked in the Current_Week, THEN THE Habit_Tracker_App SHALL display zero for the count of Habits marked on today's date and zero percent for both the today completion percentage and the Current_Week completion percentage in the Stats_Panel.
