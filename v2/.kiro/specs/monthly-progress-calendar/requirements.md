# Requirements Document

## Introduction

The Habit Tracker is a vanilla-JS application that lets users track habits on a weekly basis, persisting marks in localStorage. This feature adds a read-only **Monthly Progress Calendar** as a new tab called "Progresso do mês". The calendar shows each habit as a row and each day of the month as a column, reflecting the same localStorage marks as the existing weekly view. Marks remain toggled only in the weekly view; the monthly calendar is a passive, navigable reflection of the same data. The weekly view stays the primary, default tab and its existing behavior is left untouched.

## Glossary

- **Habit_Tracker**: The application, composed of the Weekly_View and the Monthly_Calendar.
- **Weekly_View**: The existing "Semana" tab that shows habits for a single week and allows toggling marks.
- **Monthly_Calendar**: The new "Progresso do mês" tab that shows a read-only grid of habits across the days of a single month.
- **Tab_Bar**: The UI control containing the "Semana" and "Progresso do mês" tabs.
- **State**: The persisted data under localStorage key `habit-tracker:data`, shaped as `{ habits: [{id, name}], marks: { [habitId]: { [YYYY-MM-DD]: true } } }`.
- **Mark**: A `true` value stored in State.marks for a given habit and date, indicating the habit was completed on that date.
- **dateKey**: The `YYYY-MM-DD` string identifying a calendar day, produced by the existing `dateKey(date)` helper.
- **Stats_Panel**: The existing statistics panel that belongs to the Weekly_View.

## Requirements

### Requirement 1: Tab Bar and View Switching

**User Story:** As a user, I want to switch between my weekly and monthly views via tabs, so that I can review my progress at different time scales.

#### Acceptance Criteria

1. THE Tab_Bar SHALL display two tabs labeled "Semana" and "Progresso do mês".
2. THE Tab_Bar SHALL open with the "Semana" tab selected by default.
3. WHEN the user clicks a tab, THE Tab_Bar SHALL switch the visible content to the selected tab's view.
4. WHEN the "Progresso do mês" tab is selected, THE Monthly_Calendar SHALL open on the current month.
5. WHEN the user switches from the Monthly_Calendar back to the Weekly_View, THE Habit_Tracker SHALL restore the Weekly_View to its prior navigated week.

### Requirement 2: Monthly Calendar Grid Layout

**User Story:** As a user, I want each habit as a row and each day of the month as a column, so that I can review my completion for the whole month at once.

#### Acceptance Criteria

1. THE Monthly_Calendar SHALL render one row per habit present in State.
2. THE Monthly_Calendar SHALL render one column per day of the displayed month.
3. THE Monthly_Calendar SHALL show only the day number in each column header.
4. WHEN State contains no habits, THE Monthly_Calendar SHALL render the day columns with no habit rows.

### Requirement 3: Day Mark Indicators

**User Story:** As a user, I want completed days to look distinct from incomplete and future days, so that I can scan my monthly progress at a glance.

#### Acceptance Criteria

1. WHEN a day is marked in State, THE Monthly_Calendar SHALL render a filled dot for that habit and day.
2. WHEN a day is not marked in State and the day is not in the future, THE Monthly_Calendar SHALL render an empty dot with an outline for that habit and day.
3. WHEN a day is in the future, THE Monthly_Calendar SHALL render no dot for that habit and day.

### Requirement 4: Month Navigation

**User Story:** As a user, I want to move between months with arrows, so that I can review past and future months.

#### Acceptance Criteria

1. THE Monthly_Calendar SHALL display a previous-month arrow and a next-month arrow.
2. WHEN the user clicks the previous-month arrow, THE Monthly_Calendar SHALL display the month preceding the currently displayed month.
3. WHEN the user clicks the next-month arrow, THE Monthly_Calendar SHALL display the month following the currently displayed month.

### Requirement 5: Today Highlight

**User Story:** As a user, I want today's column highlighted, so that I can locate today quickly within the month.

#### Acceptance Criteria

1. WHILE the displayed month contains the current date, THE Monthly_Calendar SHALL apply a light highlight to the column for the current date.
2. WHILE the displayed month does not contain the current date, THE Monthly_Calendar SHALL apply no column highlight.

### Requirement 6: Read-Only Behavior and Data Sync

**User Story:** As a user, I want the monthly calendar to stay in sync with the weekly view, so that marks I toggle in the weekly view appear in the monthly calendar without toggling them twice.

#### Acceptance Criteria

1. THE Monthly_Calendar SHALL display marks as non-interactive indicators.
2. WHEN a mark is toggled in the Weekly_View, THE Monthly_Calendar SHALL reflect the updated mark on the next render.
3. THE Monthly_Calendar SHALL read marks from the same State and dateKey as the Weekly_View.

### Requirement 7: Preserve Existing Weekly Functionality

**User Story:** As a user, I want the weekly view to keep working exactly as before, so that my existing habits routine is not disrupted.

#### Acceptance Criteria

1. THE Weekly_View SHALL remain the primary tab of the Habit_Tracker.
2. THE Habit_Tracker SHALL preserve the existing behavior of the Weekly_View, Stats_Panel, add-habit form, and week navigation alongside the Monthly_Calendar.

### Requirement 8: Horizontal Scroll for Narrow Screens

**User Story:** As a user on a narrow screen, I want to scroll the calendar horizontally, so that I can still reach all day columns of a 31-day month.

#### Acceptance Criteria

1. WHEN the calendar grid exceeds the available viewport width, THE Monthly_Calendar SHALL enable horizontal scrolling of the grid through a scrollable wrapper.
