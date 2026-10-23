# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2026-10-23 - Explicit ARIA semantics for custom filter buttons
**Learning:** Screen readers fail to announce which filter is currently active if relying solely on visual CSS classes on generic buttons used as filter lists.
**Action:** Always include the `aria-pressed` attribute dynamically on button-based filter lists or toggles to ensure accessible state communication.
