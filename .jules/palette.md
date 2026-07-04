# Palette's Journal - Critical UX/A11y Learnings
## 2024-07-04 - Explicit ARIA semantics for custom tab components
**Learning:** When building custom tab components where the container has `role="tablist"`, it is critical to explicitly declare `role="tab"` and the `aria-selected` attribute on interactive child elements to maintain correct ARIA semantics and screen reader accessibility.
**Action:** Always verify that interactive children of `[role="tablist"]` include `role="tab"` and `aria-selected`.
