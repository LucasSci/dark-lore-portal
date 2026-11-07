# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2024-11-07 - Add aria-pressed to generic button filters
**Learning:** Screen readers fail to announce the active state of button-based filters relying only on CSS classes.
**Action:** Added aria-pressed attribute dynamically to button toggles to ensure accessible state communication.
