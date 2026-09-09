## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.

## 2024-09-09 - Using ConfirmActionDialog instead of window.confirm
**Learning:** Native `window.confirm` dialogs interrupt the user flow, block the main thread, and lack the design consistency of the rest of the application. They also cannot be styled for better accessibility and readability.
**Action:** Replace `window.confirm` calls with custom React dialog components like `ConfirmActionDialog` to ensure a consistent, non-blocking, and accessible experience.
