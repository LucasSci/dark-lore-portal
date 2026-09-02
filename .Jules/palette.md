## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-18 - Replacing window.confirm with ConfirmActionDialog
**Learning:** The native window.confirm dialog is not accessible (lacks screen reader context, trapping issues) and breaks the UI design system flow. Replacing it with a custom dialog improves accessibility, consistency, and allows graceful exit animations.
**Action:** Use ConfirmActionDialog for destructive actions, split the inline logic into open/confirm hooks, mount the dialog unconditionally to allow exit animations, and use optional chaining for text to avoid runtime errors when the state is deleted.
