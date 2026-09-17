## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-18 - Avoid Native Window Prompts for Destructive Actions
**Learning:** Native `window.confirm` dialogs interrupt the user flow harshly, lack the application's visual styling, and provide poor accessibility hooks, making destructive actions feel abrupt and out of place in a polished design system.
**Action:** Replace all instances of `window.confirm` with the unified `ConfirmActionDialog` custom component to ensure consistent styling, clear screen reader announcements, and a smoother UX when confirming destructive operations.
