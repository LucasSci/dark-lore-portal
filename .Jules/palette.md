## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-06-21 - Replace native dialogs with UI components
**Learning:** Native browser dialogs (like window.confirm) block the main thread and break out of the app's visual language, leading to a jarring user experience. Replacing them with custom accessible React dialog components maintains design consistency, improves accessibility (via focus trapping and ARIA roles), and keeps interactions smooth.
**Action:** Always replace window.confirm with the app's ConfirmActionDialog component for destructive actions.
