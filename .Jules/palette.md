## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.

## 2026-06-13 - Explicit Roles in Custom Tablists
**Learning:** When building custom tab components where the container has `role="tablist"`, the interactive child elements must explicitly declare `role="tab"` and an `aria-selected` boolean attribute to maintain correct ARIA semantics and screen reader accessibility.
**Action:** Always ensure that child elements of a `tablist` have the `role="tab"` and `aria-selected` attributes explicitly set.
