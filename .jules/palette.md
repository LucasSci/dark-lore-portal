# Palette's Journal - Critical UX/A11y Learnings
## 2026-06-15 - Tablist Accessibility
**Learning:** When using role="tablist", children must explicitly declare role="tab" and an aria-selected boolean attribute to maintain correct ARIA semantics.
**Action:** Always verify child roles and states when creating custom tab containers.
