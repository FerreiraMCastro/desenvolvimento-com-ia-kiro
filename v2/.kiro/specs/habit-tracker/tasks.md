# Implementation Plan: Habit Tracker App

## Overview

Build the Habit_Tracker_App as three files (`index.html`, `styles.css`, `app.js`) with plain HTML, CSS, and JavaScript — no frameworks, no build step, no external dependencies. The app registers habits, displays them across a Sunday-to-Saturday weekly table with toggleable completion marks, shows a statistics panel always reflecting the current week, and persists everything to `localStorage`. The UI is in Portuguese with `dd/mm` dates.

## Tasks

- [x] 1. Create `index.html` page structure
  - [x] 1.1 Build the page skeleton linking `styles.css` and `app.js`, and lay out the four regions with their elements per the design's UI component diagram: Stats Panel (`#stats` with Total de Hábitos, Marcados Hoje, % Hoje, % Semana Atual), Week Navigation (`#week-nav` with prev arrow, range label, next arrow, Hoje button), Add Habit Form (`#add-form` with text input, Adicionar button, error message element), and Weekly Table (`#weekly-table` with header row placeholder and habit rows)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1_

- [x] 2. Create `styles.css`
  - [x] 2.1 Style the four regions, including the today-column highlight (active when Navigated_Week equals Current_Week), cell buttons with mark on/off states, the invalid-name error indication, and a clean responsive layout
  - _Requirements: 1.2, 3.5_

- [x] 3. Implement state, persistence, and date utilities in `app.js`
  - [x] 3.1 Implement `loadState()` and `saveState(state)` persisting under localStorage key `habit-tracker:data` (try/catch, empty-state fallback), plus pure date utils: `getWeekStart(date)`, `getWeekDays(weekStart)`, `dateKey(date)` returning `YYYY-MM-DD`, `formatDDMM(date)` returning `dd/mm`, and `formatDayHeader(date, abbr)` returning labels like `Sáb 19` using abbreviations Dom, Seg, Ter, Qua, Qui, Sex, Sáb
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3, 3.4_

- [x] 4. Implement stats computation and rendering in `app.js`
  - [x] 4.1 Implement `computeStats(state, currentWeekStart)` returning `{ total, markedToday, pctToday, pctWeek }` with percentages rounded to the nearest integer, always computed from the current week, plus the render functions: `renderStats`, `renderWeekNav` (range label `dd/mm - dd/mm`), `renderTable` (header with day abbreviations and dates, one row per habit with delete button, 7 cell buttons per row, today-column highlight, mark states reflecting persisted data), and `renderAll`
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.10, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Implement event handlers and initialization in `app.js`
  - [x] 5.1 Implement `onAddHabit` (validate name 1–50 chars trimmed, create or show error), `onDeleteHabit(id)` (confirm dialog, remove habit and its marks), `onToggleMark(habitId, date)`, `onPrevWeek`, `onNextWeek`, `onToday`; wire all handlers to their DOM elements, initialize `navigatedWeekStart` to the current week, and call `renderAll` on page load
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 6. Disable future-day cell buttons
  - [x] 6.1 In `renderTable` (`app.js`), add a `disabled` class and skip the click listener for cell buttons whose date is after today (string comparison of `dateKey` against today's key); add a defensive guard in `onToggleMark` to ignore future dates; add a `.cell-btn.disabled` style in `styles.css` (greyed out, no pointer)
  - _Requirements: 3.11_

## Notes

- Plain HTML/CSS/JS only: three files, no frameworks, no external dependencies, works offline by opening `index.html`.
- No automated tests, build step, or Node.js tooling; validation is manual in the browser per the design's Testing Strategy.
- Each task references specific requirements for traceability; implementation details follow the design document's interfaces and data model.
- Stats always reflect the current week (today's week) regardless of the navigated week shown in the table.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["6.1"] }
  ]
}
```
