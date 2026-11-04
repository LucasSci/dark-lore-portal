# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.

## 2026-11-04 - Native aria-expanded on menu toggles
**Learning:** Dynamically changing aria-label text on menu toggles is less effective for screen readers than using the native aria-expanded attribute.
**Action:** Always use aria-expanded to communicate open/closed state natively instead of relying on text changes.
