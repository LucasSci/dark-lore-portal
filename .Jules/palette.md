## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-06-16 - Use custom UI components instead of native window.confirm
**Learning:** Relying on native window.confirm dialogs, while simple, breaks design system consistency and offers a jarring experience compared to native UI interactions within the app.
**Action:** Always utilize the provided ConfirmActionDialog wrapper when prompting users for destructive actions like deleting resources, to maintain consistent accessibility and UI flow.
