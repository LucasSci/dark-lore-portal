# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.

## 2024-11-05 - Aria-pressed on custom filter buttons
**Learning:** When using generic buttons for filter components, screen readers fail to announce the active state based on CSS alone.
**Action:** Always include the aria-pressed attribute dynamically on filter toggles to communicate the active state to screen readers.
