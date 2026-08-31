## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-20 - Confirm Dialog for Destructive Actions
**Learning:** Replacing native `window.confirm` with a custom dialog improves accessibility and UI consistency, preventing jarring browser alerts that can break immersion and focus.
**Action:** Use `ConfirmActionDialog` instead of `window.confirm` for critical destructive actions like deletion to maintain accessible state management and design consistency.
