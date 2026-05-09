## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-19 - Replacing Native Dialogs
**Learning:** When replacing blocking browser dialogs (like `window.confirm`) with React-based UI components (like `ConfirmActionDialog`), ensure the dialog component is explicitly mounted/rendered in the returned JSX tree. Failing to render the dialog while triggering its open state will silently break the underlying functionality by making the action un-confirmable.
**Action:** Always verify the new dialog is added to the render tree and take screenshots of the specific interaction when doing frontend verifications.
