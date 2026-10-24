# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.

## 2026-10-24 - Add aria-pressed to filter buttons
**Learning:** Custom button-based filter components fail to announce the active filter state to screen readers if they rely solely on visual CSS changes.
**Action:** Always include the aria-pressed attribute dynamically on button-based filter lists or toggles to ensure accessible state communication.
