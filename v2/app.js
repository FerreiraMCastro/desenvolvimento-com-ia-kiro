'use strict';

/* ============================================================
 * Task 3.1 — State, Persistence & Date Utilities
 * ============================================================ */

const STORAGE_KEY = 'habit-tracker:data';
const DAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** In-memory state (persisted). */
let state = { habits: [], marks: {} };

/** Sunday midnight of today's week (never changes after init). */
let currentWeekStart = null;

/** Sunday midnight of the week shown in the table (changes via nav). */
let navigatedWeekStart = null;

/** Which tab is active: 'week' or 'month'. */
let activeTab = 'week';

/** Date at 00:00 of the 1st of the displayed month (reset to current month on each monthly tab open). */
let displayedMonthStart = null;

/** pt-BR month names, indexed 0 (January) → 11 (December). */
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

/* ---- Persistence ---- */

/**
 * Read state from localStorage. Returns an empty state if the key
 * is absent or the stored JSON is invalid.
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { habits: [], marks: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { habits: [], marks: {} };
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      marks: parsed.marks && typeof parsed.marks === 'object' ? parsed.marks : {}
    };
  } catch (e) {
    return { habits: [], marks: {} };
  }
}

/**
 * Serialize state to localStorage. Failures are silently ignored
 * (best-effort for an offline MVP).
 */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    /* ignore — in-memory state is the source for this session */
  }
}

/* ---- Date Utilities (pure) ---- */

/**
 * Returns the Sunday at 00:00 of the week containing `date`.
 */
function getWeekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay()); // 0 = Sunday
  return d;
}

/**
 * Returns the 7 Date objects (Sunday → Saturday) for the given week start.
 */
function getWeekDays(weekStart) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Returns a local-date-based ISO key `YYYY-MM-DD`.
 */
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

/**
 * Returns `dd/mm` for display (e.g., "19/01").
 */
function formatDDMM(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return d + '/' + m;
}

/**
 * Returns a header label like "Sáb 19".
 */
function formatDayHeader(date, abbr) {
  return abbr + ' ' + date.getDate();
}

/* ============================================================
 * Task 3.2 — Monthly View Helpers (daysInMonth, makeDot)
 * ============================================================ */

/**
 * Returns the number of days in the month containing `monthStart`
 * using the "day 0 of next month" trick: new Date(year, month+1, 0)
 * yields the last day of the target month.
 */
function daysInMonth(monthStart) {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
}

/**
 * Returns a dot element for a habit/day in the monthly grid:
 *  - future day (key > todayKey): an empty text node (no dot)
 *  - marked day: a <span class="dot dot-filled">
 *  - unmarked non-future day: a <span class="dot dot-empty">
 * Dots are non-interactive (no <button>), so the monthly view is read-only.
 */
function makeDot(s, habitId, key, todayKey) {
  if (key > todayKey) return document.createTextNode('');  // future: no dot
  const marked = s.marks[habitId] && s.marks[habitId][key];
  const dot = document.createElement('span');
  dot.className = 'dot ' + (marked ? 'dot-filled' : 'dot-empty');
  return dot;
}

/* ============================================================
 * Monthly View Rendering (renderMonthly)
 * ============================================================ */

/**
 * Rebuilds the monthly grid (#monthly-table) for the given month:
 *  - clears the header and body, then computes the day count and "today";
 *  - sets the month label to "<MonthName> <Year>";
 *  - header row: a leading "Hábito" cell, then one <th> per day showing
 *    only the day number, with `today-col` on today's column when the
 *    displayed month contains today;
 *  - body: one <tr> per habit with a leading name cell and one <td> per
 *    day holding a `makeDot(...)`; today's day cell gets `today-col`;
 *  - when there are no habits, zero body rows render while all day
 *    columns (header) remain.
 *
 * The monthly view is read-only — dots are non-interactive spans.
 */
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

  // Set month label: "<MonthName> <Year>"
  document.getElementById('month-label').textContent =
    MONTH_NAMES[monthStart.getMonth()] + ' ' + monthStart.getFullYear();

  // Header: leading "Hábito" cell, then one <th> per day (day number only)
  const labelTh = document.createElement('th');
  labelTh.className = 'm-col-name';
  labelTh.textContent = 'Hábito';
  header.appendChild(labelTh);

  for (let d = 1; d <= total; d++) {
    const th = document.createElement('th');
    th.textContent = d;
    if (monthHasToday && d === today.getDate()) th.classList.add('today-col');
    header.appendChild(th);
  }

  // Body: one row per habit; zero rows when no habits (day columns remain)
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

/* ============================================================
 * Task 4.2 — Tab Switching & Month Navigation
 * ============================================================ */

/**
 * Re-renders whichever view is currently active:
 *  - the monthly grid when the month tab is open,
 *  - the weekly stats/nav/table (renderAll) otherwise.
 */
function renderActive() {
  if (activeTab === 'month') {
    renderMonthly(state, displayedMonthStart);
  } else {
    renderAll();
  }
}

/**
 * Switches between the weekly and monthly tabs:
 *  - updates `activeTab`;
 *  - toggles `.hidden` on the view sections and `.active` on the tab buttons;
 *  - sets `displayedMonthStart` to the current month each time the monthly
 *    tab is selected (Requirement 1.4);
 *  - re-renders the active view.
 * `navigatedWeekStart` is left untouched, so switching back to the weekly
 * tab restores the previously navigated week.
 */
function onSwitchTab(tab) {
  activeTab = tab;
  const weekActive = tab === 'week';
  document.getElementById('weekly-view').classList.toggle('hidden', !weekActive);
  document.getElementById('monthly-view').classList.toggle('hidden', weekActive);
  document.getElementById('tab-week').classList.toggle('active', weekActive);
  document.getElementById('tab-month').classList.toggle('active', !weekActive);

  if (!weekActive) {
    const now = new Date();
    displayedMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  renderActive();
}

/**
 * Moves the displayed month back one month. The Date constructor
 * normalizes out-of-range months (e.g., month -1 from January yields
 * December of the previous year), so year rollover is automatic.
 */
function onPrevMonth() {
  const m = displayedMonthStart;
  displayedMonthStart = new Date(m.getFullYear(), m.getMonth() - 1, 1);
  renderMonthly(state, displayedMonthStart);
}

/**
 * Moves the displayed month forward one month, with automatic year
 * rollover handled by the Date constructor.
 */
function onNextMonth() {
  const m = displayedMonthStart;
  displayedMonthStart = new Date(m.getFullYear(), m.getMonth() + 1, 1);
  renderMonthly(state, displayedMonthStart);
}

/* ============================================================
 * Task 4.1 — Stats Computation & Rendering
 * ============================================================ */

/**
 * Computes the four statistics, always from the current week.
 * Percentages are rounded to the nearest integer.
 */
function computeStats(s, cwStart) {
  const total = s.habits.length;
  if (total === 0) {
    return { total: 0, markedToday: 0, pctToday: 0, pctWeek: 0 };
  }

  // Marked today
  const todayKey = dateKey(new Date());
  let markedToday = 0;
  for (const h of s.habits) {
    if (s.marks[h.id] && s.marks[h.id][todayKey]) markedToday++;
  }
  const pctToday = Math.round((markedToday / total) * 100);

  // Marked in current week
  const weekKeys = getWeekDays(cwStart).map(dateKey);
  let weekMarks = 0;
  for (const h of s.habits) {
    if (!s.marks[h.id]) continue;
    for (const k of weekKeys) {
      if (s.marks[h.id][k]) weekMarks++;
    }
  }
  const pctWeek = Math.round((weekMarks / (total * 7)) * 100);

  return { total, markedToday, pctToday, pctWeek };
}

/* ---- Render ---- */

function renderStats(s, cwStart) {
  const st = computeStats(s, cwStart);
  document.getElementById('stat-total').textContent = st.total;
  document.getElementById('stat-today').textContent = st.markedToday;
  document.getElementById('stat-pct-today').textContent = st.pctToday + '%';
  document.getElementById('stat-pct-week').textContent = st.pctWeek + '%';
}

function renderWeekNav(navStart) {
  const days = getWeekDays(navStart);
  document.getElementById('week-range').textContent =
    formatDDMM(days[0]) + ' - ' + formatDDMM(days[6]);
}

function renderTable(s, navStart, cwStart) {
  const header = document.getElementById('table-header');
  const body = document.getElementById('table-body');
  header.innerHTML = '';
  body.innerHTML = '';

  const weekDays = getWeekDays(navStart);
  const isCurrentWeek = dateKey(navStart) === dateKey(cwStart);
  const todayKey = dateKey(new Date());

  /* Header row — first the "Hábito" label column */
  const nameTh = document.createElement('th');
  nameTh.className = 'col-name';
  nameTh.textContent = 'Hábito';
  header.appendChild(nameTh);

  for (let i = 0; i < 7; i++) {
    const th = document.createElement('th');
    const dayDate = weekDays[i];
    if (isCurrentWeek && dateKey(dayDate) === todayKey) {
      th.classList.add('today-col');
    }
    const abbrSpan = document.createElement('span');
    abbrSpan.className = 'day-abbr';
    abbrSpan.textContent = DAY_ABBR[i];
    const dateSpan = document.createElement('span');
    dateSpan.className = 'day-date';
    dateSpan.textContent = dayDate.getDate();
    th.appendChild(abbrSpan);
    th.appendChild(dateSpan);
    header.appendChild(th);
  }

  /* Body rows — one per habit */
  for (const habit of s.habits) {
    const tr = document.createElement('tr');

    // Name + delete
    const nameTd = document.createElement('td');
    nameTd.className = 'habit-name-cell';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = habit.name;
    nameTd.appendChild(nameSpan);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '🗑';
    delBtn.title = 'Excluir hábito';
    delBtn.setAttribute('aria-label', 'Excluir ' + habit.name);
    delBtn.addEventListener('click', () => onDeleteHabit(habit.id));
    nameTd.appendChild(delBtn);

    tr.appendChild(nameTd);

    // 7 day cells
    for (let i = 0; i < 7; i++) {
      const dayDate = weekDays[i];
      const td = document.createElement('td');
      if (isCurrentWeek && dateKey(dayDate) === todayKey) {
        td.classList.add('today-col');
      }

      const btn = document.createElement('button');
      btn.className = 'cell-btn';
      const key = dateKey(dayDate);
      if (s.marks[habit.id] && s.marks[habit.id][key]) {
        btn.classList.add('marked');
        btn.textContent = '✓';
      }
      if (key > todayKey) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => onToggleMark(habit.id, dayDate));
      }
      td.appendChild(btn);
      tr.appendChild(td);
    }

    body.appendChild(tr);
  }
}

function renderAll() {
  renderStats(state, currentWeekStart);
  renderWeekNav(navigatedWeekStart);
  renderTable(state, navigatedWeekStart, currentWeekStart);
}

/* ============================================================
 * Task 5.1 — Event Handlers & Initialization
 * ============================================================ */

function onAddHabit() {
  const input = document.getElementById('habit-input');
  const errorEl = document.getElementById('form-error');
  const name = input.value.trim();

  if (name.length === 0 || name.length > 50) {
    errorEl.textContent = 'O nome deve ter entre 1 e 50 caracteres.';
    errorEl.classList.add('visible');
    input.classList.add('error');
    return;
  }

  // Generate id without crypto.randomUUID
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  state.habits.push({ id: id, name: name });
  saveState(state);

  input.value = '';
  input.classList.remove('error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');

  renderAll();
}

function onDeleteHabit(id) {
  const habit = state.habits.find(function (h) { return h.id === id; });
  if (!habit) return;

  if (!confirm('Excluir o hábito "' + habit.name + '"?')) return;

  state.habits = state.habits.filter(function (h) { return h.id !== id; });
  delete state.marks[id];
  saveState(state);
  renderAll();
}

function onToggleMark(habitId, date) {
  const key = dateKey(date);
  // Defensive guard: ignore future dates (Requirement 3.11)
  if (key > dateKey(new Date())) return;
  if (!state.marks[habitId]) {
    state.marks[habitId] = {};
  }
  if (state.marks[habitId][key]) {
    delete state.marks[habitId][key];
  } else {
    state.marks[habitId][key] = true;
  }
  saveState(state);
  renderAll();
}

function onPrevWeek() {
  navigatedWeekStart = new Date(navigatedWeekStart);
  navigatedWeekStart.setDate(navigatedWeekStart.getDate() - 7);
  renderAll();
}

function onNextWeek() {
  navigatedWeekStart = new Date(navigatedWeekStart);
  navigatedWeekStart.setDate(navigatedWeekStart.getDate() + 7);
  renderAll();
}

function onToday() {
  navigatedWeekStart = new Date(currentWeekStart);
  renderAll();
}

/* ---- Init ---- */

function init() {
  state = loadState();
  currentWeekStart = getWeekStart(new Date());
  navigatedWeekStart = new Date(currentWeekStart);

  // Wire up event listeners
  document.getElementById('add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    onAddHabit();
  });
  document.getElementById('prev-week').addEventListener('click', onPrevWeek);
  document.getElementById('next-week').addEventListener('click', onNextWeek);
  document.getElementById('today-btn').addEventListener('click', onToday);

  // Tab + month navigation listeners
  document.getElementById('tab-week').addEventListener('click', function () { onSwitchTab('week'); });
  document.getElementById('tab-month').addEventListener('click', function () { onSwitchTab('month'); });
  document.getElementById('prev-month').addEventListener('click', onPrevMonth);
  document.getElementById('next-month').addEventListener('click', onNextMonth);

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
