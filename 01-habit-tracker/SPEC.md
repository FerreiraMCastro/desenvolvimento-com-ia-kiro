# Habit Tracker - Specification

## 1. Project Overview

- **Project Name**: Habit Tracker
- **Type**: Single-page web application
- **Core Functionality**: A browser-based habit tracking app that allows users to register habits, mark daily completions, track consecutive day streaks, and export/import data as CSV
- **Target Users**: Individuals who want a simple, offline-capable habit tracker without account creation or cloud storage

## 2. UI/UX Specification

### Layout Structure

- **Container**: Centered card layout, max-width 700px
- **Header**: App title with streak icon
- **Input Section**: Form to add new habits
- **Habit List**: Grid/card display of all habits with daily checkboxes
- **Footer**: Export/Import buttons

### Visual Design

- **Color Palette**:
  - Background: `#1a1a2e` (deep navy)
  - Card Background: `#16213e` (dark blue)
  - Primary Accent: `#e94560` (vibrant coral-red)
  - Secondary Accent: `#0f3460` (medium blue)
  - Success/Streak: `#00d9a5` (mint green)
  - Text Primary: `#eaeaea`
  - Text Secondary: `#a0a0a0`
  - Border: `#2a2a4a`

- **Typography**:
  - Font Family: "Outfit" (Google Fonts) - modern geometric sans-serif
  - Headings: 600 weight, 1.8rem for title
  - Body: 400 weight, 1rem
  - Streak counter: 700 weight

- **Spacing**:
  - Card padding: 2rem
  - Section gap: 1.5rem
  - Item gap: 0.75rem

- **Visual Effects**:
  - Card shadow: `0 8px 32px rgba(0, 0, 0, 0.3)`
  - Subtle border-radius: 12px
  - Hover transitions: 0.2s ease
  - Streak glow effect on high streaks

### Components

1. **Add Habit Form**
   - Text input with placeholder "New habit..."
   - Add button with + icon
   - Input clears after adding

2. **Habit Card**
   - Habit name (editable on double-click)
   - Delete button (X icon, appears on hover)
   - Streak counter with fire/flame icon
   - Last 7 days checkboxes (horizontal)
   - Day labels (Mon, Tue, Wed, etc.)

3. **Action Buttons (Footer)**
   - Export CSV button (download icon)
   - Import CSV button (upload icon, hidden file input)

4. **Empty State**
   - Friendly message when no habits exist

### Interactive Behaviors

- Hover on habit card: slight lift effect
- Checkbox click: immediate visual feedback, streak recalculates
- Delete: confirmation not required (simple UX)
- Double-click habit name: transforms to input for editing

## 3. Functionality Specification

### Core Features

1. **Add Habit**
   - User enters habit name in input
   - Press Enter or click Add button
   - Habit appears in list with 0 streak
   - Empty input not allowed

2. **Mark Habit Complete**
   - Checkboxes for the last 7 days
   - Click to toggle completion
   - Completion saved immediately to localStorage

3. **Streak Calculation**
   - Calculate consecutive days from today backwards
   - If today is unchecked, start counting from yesterday
   - Display streak count with flame icon

4. **Delete Habit**
   - Click X button on habit card
   - Habit removed immediately

5. **Edit Habit Name**
   - Double-click habit name
   - Transforms to input field
   - Press Enter or click outside to save
   - Press Escape to cancel

6. **Data Persistence**
   - All data stored in localStorage
   - Key: "habitTrackerData"
   - Structure: `{ habits: [{ id, name, completions: ["2024-01-01", ...] }] }`

7. **Export to CSV**
   - Creates downloadable CSV file
   - Columns: Habit Name, Completion Dates
   - Filename: "habitos_export.csv"

8. **Import from CSV**
   - Click button triggers file picker
   - Parses CSV and imports habits
   - Merges with existing habits (by name)
   - Shows success/error message

### Edge Cases

- Empty habit name: show inline error, don't add
- Duplicate habit name: allow (different IDs)
- Import invalid CSV: show error message
- No habits: show empty state
- localStorage unavailable: show warning

## 4. Acceptance Criteria

1. ✅ Page loads without errors
2. ✅ Can add a new habit with Enter key or button
3. ✅ Can mark/unmark habits for past 7 days
4. ✅ Streak calculates correctly (consecutive days)
5. ✅ Can delete a habit
6. ✅ Can edit habit name by double-clicking
7. ✅ Data persists after page refresh
8. ✅ Export downloads valid CSV file
9. ✅ Import successfully loads habits from CSV
10. ✅ Responsive on mobile devices