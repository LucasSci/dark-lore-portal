# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2026-10-19 - Add aria-pressed to generic active buttons
**Learning:** Screen readers fail to announce the active state of custom filter/toggle components built with generic buttons if they rely solely on visual CSS classes (like data-active).
**Action:** Always include the aria-pressed attribute dynamically on button-based filter lists or toggles to ensure accessible state communication.
