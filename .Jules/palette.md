# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2026-11-08 - Add aria-pressed to custom button lists
**Learning:** Custom button-based lists for selection require `aria-pressed` to communicate active state to screen readers, unlike native radio inputs or tabs.
**Action:** Added `aria-pressed` to active map buttons and cinematic scene buttons.
