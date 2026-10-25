# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2026-10-25 - Use aria-expanded on menu toggle buttons
**Learning:** For accessibility in React components, using aria-expanded on menu toggle buttons natively communicates their open/closed state to screen readers much better than dynamically changing the aria-label text.
**Action:** Replaced dynamic aria-label with a static one and added aria-expanded to the mobile menu toggle button in the header.
