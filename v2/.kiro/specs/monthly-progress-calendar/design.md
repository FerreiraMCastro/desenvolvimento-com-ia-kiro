# Design Document — Monthly Progress Calendar

## Introduction

This design adds a read-only **Monthly Progress Calendar** ("Progresso do mês") as a second tab in the existing vanilla-JS Habit Tracker. The weekly view ("Semana") stays the primary, default tab and its behavior is left untouched. The monthly calendar is a passive, navigable reflection of the same `localStorage` marks the weekly view toggles. There is no new persistence, no build tooling, and no automated tests; validation is manual in the browser.

The scope is intentionally minimal: a tab bar to switch views, a month grid that reads existing state, arrow-only month navigation, day indicators (filled / empty / none), a light today-column highlight, and horizontal scrolling for 31-day months.

## Overview

The design is purely additive and keeps the weekly view untouched. It introduces a Tab Bar with two tabs: "Semana" (default/primary) and "Progresso do mês" (new, read-only). The existing weekly UI is wrapped in a `#weekly-view` section and a new `#monthly-view` section is added alongside it; only one is visible at a time. The monthly grid reads the same in-memory `state` (loaded from `localStorage` via the existing `loadState`) and the same `dateKey` helper, so marks toggled in the weekly view appear in the monthly view on the next render. Two new module-level variables track the active tab and the displayed month; the existing `navigatedWeekStart` is never touched by monthly code, so returning to the weekly tab restores the prior navigated week with no extra logic.

## Architecture

The app remains a single `app.js` module with one `init()` entry point. The change is purely additive:

- A **Tab Bar** controls which of two view sections is visible.
- The existing weekly UI (stats panel, week navigation, add-habit form, weekly table) is wrapped in a `#weekly-view` section. Nothing inside it changes.
- A new `#monthly-view` section holds the month navigation and the monthly grid.
- Only one section is visible at a time; the other is hidden via a CSS class (`hidden` / `display: none`).

Two new module-level variables are introduced; everything else is reused:

```js
let activeTab = 'week';               // 'week' | 'month'
let displayedMonthStart = null;        // Date at 00:00 of the 1st of the displayed month
```

`navigatedWeekStart` (existing) is never read or written by the monthly code, so switching tabs back to the weekly view automatically restores the prior navigated week (Requirement 1.5) with no extra restoration logic.

## Components and Interfaces

All additions live in `app.js` as small, named functions alongside the existing ones. No new files.

| Component | Responsibility | Reuses |
|---|---|---|
| `onSwitchTab(tab)` | Set `activeTab`, toggle section visibility, init `displayedMonthStart` to the current month on first monthly open, and re-render the active view. | `renderAll`, `renderMonthly` |
| `renderMonthly(s, monthStart)` | Build the month grid header and body from `state` and `displayedMonthStart`. | `dateKey`, `state` |
| `onPrevMonth()` / `onNextMonth()` | Shift `displayedMonthStart` by one month and re-render the monthly view. | `renderMonthly` |
| `MONTH_NAMES` constant | pt-BR month names for the month label, mirroring the `DAY_ABBR` style. | — |

### Interfaces (function signatures)

```js
function onSwitchTab(tab)          // tab: 'week' | 'month'  -> void
function renderMonthly(s, monthStart) // s: State, monthStart: Date (1st of month) -> void
function onPrevMonth()             // -> void
function onNextMonth()             // -> void
function daysInMonth(monthStart)   // -> number (28-31)
function makeDot(s, habitId, key, todayKey) // -> Node (span | empty text node)
```

The monthly view is read-only, so it has no `onToggleMark`-equivalent and never calls `saveState`.

## Data Models

No new persistence. The monthly view reads the existing State shape directly:

```js
// Existing, unchanged, persisted under STORAGE_KEY 'habit-tracker:data'
state = {
  habits: [{ id, name }],
  marks: { [habitId]: { [YYYY_MM_DD]: true } }
};
```

`loadState()` and `saveState()` are unchanged. The monthly grid only reads `state.habits` (for rows) and `state.marks[habitId][dateKey(day)]` (for indicators). Because both views share the same in-memory `state` object, a mark toggled in the weekly view is visible in the monthly view after the next `renderMonthly` call (Requirement 6.2, 6.3).

## View Switching Mechanism

A `#tab-bar` holds two buttons:

```html
<nav id="tab-bar" aria-label="Visualizações">
  <button id="tab-week" class="tab active" type="button">Semana</button>
  <button id="tab-month" class="tab" type="button">Progresso do mês</button>
</nav>
```

The existing weekly markup is wrapped in `<section id="weekly-view">`, and the new markup in `<section id="monthly-view" class="hidden">`. `init()` wires tab clicks and defaults to the weekly tab:

```js
function onSwitchTab(tab) {
  activeTab = tab;
  const weekActive = tab === 'week';
  document.getElementById('weekly-view').classList.toggle('hidden', !weekActive);
  document.getElementById('monthly-view').classList.toggle('hidden', weekActive);
  document.getElementById('tab-week').classList.toggle('active', weekActive);
  document.getElementById('tab-month').classList.toggle('active', !weekActive);

  if (!weekActive && displayedMonthStart === null) {
    const now = new Date();
    displayedMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  renderActive();
}

function renderActive() {
  if (activeTab === 'month') {
    renderMonthly(state, displayedMonthStart);
  } else {
    renderAll();
  }
}
```

`renderAll()` (existing) is unchanged and continues to drive the weekly view. The monthly view calls only `renderMonthly`, leaving weekly state untouched.

## Monthly Grid Rendering

`renderMonthly(s, monthStart)` rebuilds the `#monthly-header` and `#monthly-body`. The number of days comes from the standard "day 0 of next month" trick, which the `Date` constructor normalizes across leap years and year rollovers:

```js
function daysInMonth(monthStart) {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
}
```

Header: a leading "Hábito" cell, then one `<th>` per day showing **only the day number** (Requirement 2.3). Body: one `<tr>` per habit; each row has a leading name cell and one `<td>` per day. The cell's indicator is chosen by mark/future status (see Day Indicators). No `<button>` elements are created, so the dots are non-interactive (Requirement 6.1).

```js
function renderMonthly(s, monthStart) {
  const header = document.getElementById('monthly-header');
  const body = document.getElementById('monthly-body');
  header.innerHTML = '';
  body.innerHTML = '';

  const total = daysInMonth(monthStart);
  const today = new Date();
  const monthHasToday =
    monthStart.getFullYear() === today.getFullYear() &&
    monthStart.getMonth() === today.getMonth();
  const todayKey = dateKey(today);
  const labelTh = document.createElement('th');
  labelTh.className = 'm-col-name';
  labelTh.textContent = 'Hábito';
  header.appendChild(labelTh);

  for (let d = 1; d <= total; d++) {
    const th = document.createElement('th');
    th.textContent = d;                       // day number only
    if (monthHasToday && d === today.getDate()) th.classList.add('today-col');
    header.appendChild(th);
  }

  for (const habit of s.habits) {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.className = 'm-habit-name';
    nameTd.textContent = habit.name;
    tr.appendChild(nameTd);

    for (let d = 1; d <= total; d++) {
      const dayDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), d);
      const key = dateKey(dayDate);
      const td = document.createElement('td');
      if (monthHasToday && d === today.getDate()) td.classList.add('today-col');
      td.appendChild(makeDot(s, habit.id, key, todayKey));
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
}
```

When `s.habits` is empty, the header still renders all day columns and the body renders zero rows (Requirement 2.4).

## Day Indicators

A single helper picks the indicator from mark/future status, returning a non-interactive `<span>` (or nothing) so the dots cannot be toggled:

```js
function makeDot(s, habitId, key, todayKey) {
  if (key > todayKey) return document.createTextNode('');  // future: no dot
  const marked = s.marks[habitId] && s.marks[habitId][key];
  const dot = document.createElement('span');
  dot.className = 'dot ' + (marked ? 'dot-filled' : 'dot-empty');
  return dot;
}
```

- `dot-filled`: solid green dot (Requirement 3.1).
- `dot-empty`: outlined dot (Requirement 3.2).
- future day: empty text node, no dot element (Requirement 3.3).

Comparison uses the existing `dateKey` string format (`YYYY-MM-DD`), whose lexicographic order matches calendar order, so `key > todayKey` correctly identifies future days.

## Month Navigation

The monthly view has its own compact nav with arrows only (no "Hoje" button) and a month label:

```html
<nav id="month-nav" aria-label="Navegação de mês">
  <button id="prev-month" type="button" aria-label="Mês anterior">◀</button>
  <span id="month-label">—</span>
  <button id="next-month" type="button" aria-label="Próximo mês">▶</button>
</nav>
```

Navigation shifts by exactly one month using the `Date` constructor, which handles year rollover automatically:

```js
function onPrevMonth() {
  const m = displayedMonthStart;
  displayedMonthStart = new Date(m.getFullYear(), m.getMonth() - 1, 1);
  renderMonthly(state, displayedMonthStart);
}

function onNextMonth() {
  const m = displayedMonthStart;
  displayedMonthStart = new Date(m.getFullYear(), m.getMonth() + 1, 1);
  renderMonthly(state, displayedMonthStart);
}
```

The label is rendered inside `renderMonthly` from a `MONTH_NAMES` constant:

```js
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

document.getElementById('month-label').textContent =
  MONTH_NAMES[monthStart.getMonth()] + ' ' + monthStart.getFullYear();
```

## Today Highlight

During rendering, `monthHasToday` is true only when the displayed month/year equals today's month/year. When true, the column whose day number equals `today.getDate()` gets the `today-col` class on both its `<th>` and every row's `<td>`. When false, no column gets the class (Requirement 5.1, 5.2). This reuses the same `today-col` concept as the weekly table, applied with a lighter monthly-specific style.

## CSS Approach

Add a small, self-contained block to `styles.css`. Key pieces:

- `.hidden { display: none; }` — toggles view sections.
- `#tab-bar` — flex row of two `.tab` buttons; `.tab.active` gets the accent background.
- `#monthly-nav` — mirrors `#week-nav` spacing; plain arrow buttons.
- `.monthly-scroll { overflow-x: auto; }` — wraps the monthly table so 31-day months scroll horizontally instead of breaking layout (Requirement 8.1).
- `#monthly-table` — like `#weekly-table` but with smaller, fixed-width cells and `border-collapse: collapse`.
- `.dot` — small circle; `.dot-filled` (green, solid) and `.dot-empty` (transparent with border).
- `.today-col` — reused name, given a lighter monthly background (e.g. `#eff6ff`).

```css
.hidden { display: none; }

#tab-bar { display: flex; gap: 8px; margin-bottom: 20px; }
.tab {
  flex: 1; padding: 10px; border: none; border-radius: 8px;
  background: #e5e7eb; cursor: pointer; font-size: 0.95rem;
}
.tab.active { background: #2563eb; color: #fff; }

.monthly-scroll { overflow-x: auto; }
#monthly-table { border-collapse: collapse; background: #fff; border-radius: 10px; }
#monthly-table th, #monthly-table td {
  border: 1px solid #e5e7eb; text-align: center; min-width: 28px; padding: 4px 2px;
}
.m-col-name, .m-habit-name { min-width: 110px; text-align: left; padding-left: 8px; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
.dot-filled { background: #16a34a; }
.dot-empty { background: transparent; border: 2px solid #d1d5db; }
#monthly-table .today-col { background: #eff6ff; }
```

## Error Handling

The monthly view adds no new failure modes. It relies entirely on the existing defensive `loadState()` (which returns an empty state on missing/invalid JSON) and on the `Date` constructor (which normalizes out-of-range month values, so year rollover in navigation is safe). Rendering degrades gracefully: an empty `state.habits` yields day columns with zero habit rows, and an out-of-range day is never produced because `daysInMonth` bounds the loop from 1 to the real last day.

## Testing Strategy

Per scope, there is no automated test suite and no property-based test runner; validation is manual in the browser. The Correctness Properties below double as the manual verification checklist: each property is exercised by representative inputs in the browser (varying months, habit counts, mark patterns, and a narrow viewport). Existing weekly behavior is regression-checked by manually exercising the add-habit form, week navigation, the stats panel, and mark toggling after the tab bar is added. No new test files, Node.js, or npm are introduced.

## Correctness Properties

Validation is manual in the browser (no automated test suite, per scope). The following universal properties describe the expected behavior and serve as the manual verification checklist.

### Property 1: Grid structure matches state and month

*For any* state and displayed month, the Monthly_Calendar renders exactly one row per habit (zero rows when there are no habits), exactly one column per day of that month, and each day column header shows only the day number.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 2: Dot indicator reflects mark and future status

*For any* habit and any day in the displayed month, a marked day renders a filled dot, an unmarked non-future day renders an empty outlined dot, and a future day renders no dot.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 3: Month navigation moves by exactly one month

*For any* displayed month, clicking the previous arrow shows the immediately preceding month and clicking the next arrow shows the immediately following month, with year rollover handled correctly.

**Validates: Requirements 4.2, 4.3**

### Property 4: Today highlight appears only when the displayed month contains today

*For any* displayed month, the column for the current date is lightly highlighted if and only if the displayed month contains the current date.

**Validates: Requirements 5.1, 5.2**

### Property 5: Opening the monthly tab shows the current month

*For any* point in time, selecting the "Progresso do mês" tab displays the current month.

**Validates: Requirements 1.4**

### Property 6: Switching tabs preserves the weekly view's navigated week

*For any* navigated week in the weekly view, switching to the monthly tab and then back to the weekly tab restores that same navigated week.

**Validates: Requirements 1.5**

### Property 7: Monthly marks reflect weekly toggles on re-render

*For any* mark toggled in the weekly view, the monthly calendar reflects the updated mark after its next render.

**Validates: Requirements 6.2**

### Notes on non-property criteria

- 1.1, 1.2, 1.3, 4.1, 6.1, 7.1 are specific UI-presence or default-state checks, verified manually as examples.
- 6.3 is an architectural constraint (shared State/dateKey source), confirmed by code inspection.
- 7.2 is a non-regression guarantee, verified by manually exercising all existing weekly features after the change.
- 8.1 is a narrow-viewport layout edge case, verified by viewing a 31-day month on a narrow screen.
