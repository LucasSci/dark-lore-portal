# Palette's Journal - Critical UX/A11y Learnings
## 2024-10-24 - Replace window.confirm with ConfirmActionDialog
**Learning:** The native window.confirm dialog is not stylable, provides poor accessibility, and interrupts the natural flow of the application UI.
**Action:** Replaced inline window.confirm with a custom React ConfirmActionDialog component. Split the inline logic into two separate handlers (one to open the dialog, one for the actual confirmation action) and mounted the dialog unconditionally in the JSX tree to allow graceful exit animations.
