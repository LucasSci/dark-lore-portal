# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.

## 2024-11-06 - Add aria-pressed to custom filter groups
**Learning:** When building custom filter components using generic buttons instead of native radio inputs, screen readers fail to announce which filter is currently active if relying solely on visual CSS classes.
**Action:** Always include the aria-pressed attribute dynamically on button-based filter lists to ensure accessible state communication.
