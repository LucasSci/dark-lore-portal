# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.

## 2026-10-31 - Add aria-expanded to mobile menu toggle
**Learning:** Always use aria-expanded on menu toggle buttons to natively communicate their open/closed state, rather than dynamically changing the aria-label text.
**Action:** Added aria-expanded to the mobile menu toggle button to improve screen reader support.
