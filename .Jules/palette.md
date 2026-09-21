## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-20 - Replace window.confirm with accessible ConfirmActionDialog
**Learning:** Using native `window.confirm` blocks the main thread, lacks styling flexibility, and provides a poor, inaccessible UX. Replacing it with a custom dialog component (like `ConfirmActionDialog`) improves accessibility and allows for graceful exit animations.
**Action:** When confirming destructive actions, avoid `window.confirm` and always implement accessible dialogs with separate trigger/confirm callbacks, and use optional chaining for dynamic properties to avoid runtime errors during unmounting.
