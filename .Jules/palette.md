# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2024-10-20 - Use aria-expanded for menu toggles
**Learning:** Dynamically changing aria-label to communicate open/closed state of a menu toggle is poor for accessibility. Native aria-expanded property provides better screen reader support.
**Action:** Replaced dynamic aria-label with aria-expanded on mobile menu toggle to improve a11y.
