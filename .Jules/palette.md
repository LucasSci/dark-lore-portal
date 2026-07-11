## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-07-11 - Replace window.confirm with ConfirmActionDialog
**Learning:** Native window.confirm blocks the main thread and breaks UI flow, making it less accessible and unstyled. It's better to use accessible React dialogs.
**Action:** Replaced native window.confirm with ConfirmActionDialog by splitting the action logic into dialog state management and the confirm callback.
