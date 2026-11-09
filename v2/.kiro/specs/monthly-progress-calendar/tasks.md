# Implementation Plan: Monthly Progress Calendar

## Overview

Add a read-only **Monthly Progress Calendar** as a second tab ("Progresso do mês") in the existing vanilla-JS Habit Tracker. The change is purely additive across three files: `index.html` (tab bar, wrapped weekly section, new monthly section), `styles.css` (tabs, monthly grid, dots, today highlight, horizontal scroll), and `app.js` (new module state, constants, helpers, rendering, view switching, month navigation, and init wiring). The weekly view ("Semana") stays the default primary tab and its behavior is left untouched. The monthly grid reads the same in-memory `state` and `dateKey` helper as the weekly view, so marks toggled in the weekly view appear in the monthly view on the next render. No new persistence, no build tooling, and no automated tests; validation is manual in the browser.

## Tasks

- [x] 1. Update HTML structure for tabs and views (index.html)
  - [x] 1.1 Add the tab bar and wrap the existing weekly UI in a `#weekly-view` section
    - Add a `<nav id="tab-bar" aria-label="Visualizações">` with two buttons: `<button id="tab-week" class="tab active" type="button">Semana</button>` and `<button id="tab-month" class="tab" type="button">Progresso do mês</button>`, placed above the stats panel
    - Wrap the existing stats panel, week navigation, add-habit form, and weekly table in a `<section id="weekly-view">` without changing any inner markup
    - _Requirements: 1.1, 1.2, 7.1_

  - [x] 1.2 Add the `#monthly-view` section with month navigation and the monthly grid table
    - Add `<section id="monthly-view" class="hidden">` after `#weekly-view`
    - Inside it add `<nav id="month-nav" aria-label="Navegação de mês">` with `<button id="prev-month" type="button" aria-label="Mês anterior">◀</button>`, `<span id="month-label">—</span>`, and `<button id="next-month" type="button" aria-label="Próximo mês">▶</button>`
    - Add a scrollable wrapper `<div class="monthly-scroll">` containing `<table id="monthly-table">` with `<thead><tr id="monthly-header"></tr></thead>` and `<tbody id="monthly-body"></tbody>`
    - _Requirements: 1.4, 2.1, 2.2, 4.1, 8.1_

- [x] 2. Add CSS for tabs, monthly grid, and day indicators (styles.css)
  - [x] 2.1 Add the `.hidden` utility and tab bar styles
    - Add `.hidden { display: none; }` to toggle view sections
    - Add `#tab-bar` as a flex row with `gap` and bottom margin, `.tab` buttons with flex, padding, border-radius, neutral background, and `.tab.active` with the accent background (`#2563eb`) and white text
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Add month navigation, monthly table, dot, and today-column styles
    - Add `#month-nav` mirroring the `#week-nav` spacing with plain arrow buttons
    - Add `.monthly-scroll { overflow-x: auto; }` so 31-day months scroll horizontally
    - Add `#monthly-table` with `border-collapse: collapse`, and `#monthly-table th, #monthly-table td` with centered text, fixed `min-width`, and thin borders; add `.m-col-name`/`.m-habit-name` left-aligned with min width
    - Add `.dot` (small inline-block circle), `.dot-filled` (solid green `#16a34a`), and `.dot-empty` (transparent with `2px` border `#d1d5db`)
    - Add `#monthly-table .today-col { background: #eff6ff; }` for the light today-column highlight
    - _Requirements: 2.2, 3.1, 3.2, 5.1, 8.1_

- [x] 3. Add monthly state, constants, and helpers (app.js)
  - [x] 3.1 Add module-level variables and the `MONTH_NAMES` constant
    - Add `let activeTab = 'week';` (`'week'` | `'month'`) and `let displayedMonthStart = null;` (Date at 00:00 of the 1st of the displayed month)
    - Add the `MONTH_NAMES` array of pt-BR month names, mirroring the `DAY_ABBR` style
    - Place these alongside the existing module-level variables; do not touch `navigatedWeekStart` so returning to the weekly tab restores the prior navigated week
    - _Requirements: 1.4, 1.5, 4.2, 4.3_

  - [x] 3.2 Add the `daysInMonth` and `makeDot` helper functions
    - Add `daysInMonth(monthStart)` using the day-0-of-next-month trick to return the day count (28-31)
    - Add `makeDot(s, habitId, key, todayKey)` that returns an empty text node for future days (`key > todayKey`), a `<span class="dot dot-filled">` for marked days, and a `<span class="dot dot-empty">` for unmarked non-future days; no `<button>` so dots are non-interactive
    - Reuse the existing `dateKey` string format (lexicographic order matches calendar order)
    - _Requirements: 2.2, 3.1, 3.2, 3.3, 6.1_

- [x] 4. Add monthly rendering and view switching (app.js)
  - [x] 4.1 Add the `renderMonthly` function
    - Clear `#monthly-header` and `#monthly-body`; compute `daysInMonth(monthStart)` and `today`
    - Set `#month-label` text to `MONTH_NAMES[monthStart.getMonth()] + ' ' + monthStart.getFullYear()`
    - Append a leading "Hábito" `<th class="m-col-name">`, then one `<th>` per day showing only the day number, adding `today-col` when the displayed month contains today
    - For each habit, append a `<tr>` with a leading name `<td class="m-habit-name">` and one `<td>` per day containing `makeDot(...)`; add `today-col` to the matching day cell; render zero rows when there are no habits while keeping all day columns
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 5.1, 5.2_

  - [x] 4.2 Add `onSwitchTab`, `renderActive`, `onPrevMonth`, and `onNextMonth`
    - Add `onSwitchTab(tab)`: set `activeTab`, toggle `.hidden` on `#weekly-view`/`#monthly-view`, toggle `.active` on `#tab-week`/`#tab-month`; initialize `displayedMonthStart` to the current month on first monthly open (`displayedMonthStart === null`); call `renderActive()`
    - Add `renderActive()`: call `renderMonthly(state, displayedMonthStart)` when `activeTab === 'month'`, else call the existing `renderAll()`
    - Add `onPrevMonth()`/`onNextMonth()`: shift `displayedMonthStart` by one month via the `Date` constructor (handles year rollover) and call `renderMonthly(state, displayedMonthStart)`
    - Leave `navigatedWeekStart` untouched so switching back to the weekly tab restores the prior week
    - _Requirements: 1.3, 1.4, 1.5, 4.2, 4.3, 6.2_

- [x] 5. Wire up tab and month navigation in init (app.js)
  - [x] 5.1 Wire the tab buttons and month navigation buttons in `init()`
    - Add click listeners on `#tab-week` (→ `onSwitchTab('week')`) and `#tab-month` (→ `onSwitchTab('month')`)
    - Add click listeners on `#prev-month` (→ `onPrevMonth()`) and `#next-month` (→ `onNextMonth()`)
    - Keep the existing weekly listeners and default to the weekly tab; this is the final wiring step that integrates all new code with the existing `init()`
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 6. Checkpoint - Manual verification in the browser
  - Verify tab switching opens "Semana" by default and shows the monthly view on "Progresso do mês"
  - Verify the monthly grid renders one row per habit, one column per day with day-number headers, filled/empty/no dots by mark and future status, today-column highlight, arrow-only month navigation, and horizontal scroll for 31-day months on a narrow screen
  - Confirm existing weekly behavior (add-habit form, week navigation, stats panel, mark toggling) is unchanged after the tab bar is added
  - Ask the user if questions arise.

## Notes

- Tasks are sequential within each file and build incrementally; each step integrates with the previous one, ending with wiring in `init()`.
- The monthly view is read-only: it reads the shared in-memory `state` and existing `dateKey` helper, and never calls `saveState`, so marks toggled in the weekly view appear in the monthly view on the next render.
- `navigatedWeekStart` is never read or written by the monthly code, so switching tabs back to the weekly view restores the prior navigated week with no extra logic.
- No automated tests, property-based tests, Node.js, or npm are introduced; validation is manual in the browser per the design's testing strategy. The design's Correctness Properties serve as the manual verification checklist.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.2"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["4.2"] },
    { "id": 4, "tasks": ["5.1"] }
  ]
}
```
