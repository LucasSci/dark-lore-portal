## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-18 - Replace window.confirm with Custom ConfirmActionDialog
**Learning:** The native `window.confirm` acts as a blocking synchronous UI element which hurts accessibility and aesthetic consistency in modern async React architectures.
**Action:** Always opt for accessible Radix-based custom `ConfirmActionDialog` components and safely split the hook logic into opening the dialog and executing the destructive action.
