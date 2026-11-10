# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-24 - Missing ARIA on Icon Buttons
**Learning:** Standalone experimental features and prototypes often neglect fundamental accessibility attributes (aria-label, title) on icon-only buttons compared to standard UI components.
**Action:** Always verify accessibility attributes when reviewing or extending experimental features.
## 2024-07-04 - Explicit ARIA semantics for custom tab components
**Learning:** When building custom tab components where the container has `role="tablist"`, it is critical to explicitly declare `role="tab"` and the `aria-selected` attribute on interactive child elements to maintain correct ARIA semantics and screen reader accessibility.
**Action:** Always verify that interactive children of `[role="tablist"]` include `role="tab"` and `aria-selected`.
## 2026-11-10 - Accessible state for toggle buttons
**Learning:** When building custom filter components using generic buttons instead of native radio inputs or `role="tab"` structures, screen readers fail to announce which filter is currently active if relying solely on visual CSS classes.
**Action:** Always include the `aria-pressed` attribute dynamically on button-based filter lists or toggles to ensure accessible state communication.
