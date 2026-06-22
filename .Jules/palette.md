## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-06-22 - Replacing Window.Confirm with UI Dialogs
**Learning:** Native `window.confirm` dialogs can block the main thread, interfering with React state execution flows, and are less accessible than integrated UI components.
**Action:** Replace `window.confirm` with a custom React dialog component (like `ConfirmActionDialog`), separating the opening logic and confirmation logic.
