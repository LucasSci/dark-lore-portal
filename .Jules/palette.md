## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-09-03 - Replace window.confirm with ConfirmActionDialog
**Learning:** Native window.confirm breaks UX consistency and accessibility (no ARIA roles, jarring browser default UI).
**Action:** Use ConfirmActionDialog for destructive actions. Safely split the previous inline action logic into two separate useCallback hooks: one to handle opening the dialog and another to execute the actual logic.
