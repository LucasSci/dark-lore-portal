## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.

## 2024-09-20 - Missing ARIA Roles in Custom Tablists
**Learning:** Custom tab components built with generic elements often specify `role="tablist"` on the container but omit `role="tab"` and `aria-selected` on the interactive children, relying only on custom `data-active` attributes for styling, which breaks screen reader semantics.
**Action:** Always ensure that interactive child elements within a `role="tablist"` explicitly declare `role="tab"` and the `aria-selected` boolean attribute.
