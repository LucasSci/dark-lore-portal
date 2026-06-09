# Palette's Journal - Critical UX/A11y Learnings
## 2026-06-09 - Add missing ARIA attributes to Tablist children
**Learning:** When building custom tab components where the container has `role="tablist"`, it is critical for accessibility that interactive child elements explicitly declare `role="tab"` and an `aria-selected` boolean attribute so that screen readers correctly interpret the tab semantics and current selection state.
**Action:** Always ensure `role="tab"` and `aria-selected` are added to interactive children of elements with `role="tablist"`.
