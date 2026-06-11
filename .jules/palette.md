# Palette's Journal - Critical UX/A11y Learnings

## 2026-06-11 - Explicit ARIA roles in custom tablists
**Learning:** When building custom tab components where the container has `role="tablist"`, always ensure the interactive child elements explicitly declare `role="tab"` and an `aria-selected` boolean attribute to maintain correct ARIA semantics and screen reader accessibility.
**Action:** Always add these explicit roles and state attributes to tab buttons rather than relying solely on generic data attributes.
