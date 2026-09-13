## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.

## 2024-05-24 - Replace native window.confirm
**Learning:** Native `window.confirm` blocks the main thread, feels out of place with the design system, and can't be easily styled or animated. Unconditionally mounting a custom dialog component and handling state in separate callbacks provides a much smoother UX.
**Action:** Always replace `window.confirm` with the custom `ConfirmActionDialog` component to maintain design consistency and allow graceful exit animations.
