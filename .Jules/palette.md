## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-20 - Custom Confirmation Dialogs
**Learning:** The application uses a custom `ConfirmActionDialog` wrapper to maintain design system consistency, accessible focus management, and destructive action styling compared to native `window.confirm`.
**Action:** Always replace native `window.confirm` with the `ConfirmActionDialog` component, ensuring state logic is safely split between opening the dialog and executing the callback.
