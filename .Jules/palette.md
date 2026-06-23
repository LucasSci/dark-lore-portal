## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-06-23 - Replaced window.confirm with ConfirmActionDialog
**Learning:** The native window.confirm is disruptive, blocks the main thread, and provides poor UI consistency. A React-based dialog component like ConfirmActionDialog is far better for accessible, non-blocking disruptive actions.
**Action:** Always prefer the ConfirmActionDialog component for destructive actions to maintain consistency and accessibility.
