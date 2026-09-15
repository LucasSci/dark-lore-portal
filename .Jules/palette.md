## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-18 - Replacing window.confirm with Custom React Dialog
**Learning:** The native `window.confirm` is visually inconsistent with the design system and causes synchronous blocking, which can be jarring in a modern React application. It also lacks accessibility controls.
**Action:** Always replace `window.confirm` with a custom, accessible Radix UI-based dialog component like `ConfirmActionDialog` to maintain design system consistency, allow graceful exit animations, and provide a better screen reader experience.
