## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-09-11 - Custom Dialog instead of window.confirm
**Learning:** Native window.confirm blocks the main thread, cannot be styled to match the design system, and provides a jarring user experience compared to the rest of the application.
**Action:** Use custom ConfirmActionDialog components to replace native window.confirm for destructive actions, safely splitting the previous inline action logic into two separate hooks.
