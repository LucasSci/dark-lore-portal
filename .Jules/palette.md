# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2026-10-29 - Add aria-pressed to generic selection buttons
**Learning:** Generic buttons used as lists/toggles without native tab/radio patterns require aria-pressed to correctly announce their state to screen readers.
**Action:** Add aria-pressed attribute dynamically to button-based filter lists or toggles to ensure accessible state communication.
