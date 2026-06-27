# Palette's Journal - Critical UX/A11y Learnings
## 2024-06-27 - Add missing tab roles and aria-selected in tablist
**Learning:** In custom tab components where the container has `role="tablist"`, interactive child elements must explicitly declare `role="tab"` and an `aria-selected` boolean attribute to maintain correct ARIA semantics and screen reader accessibility.
**Action:** Always ensure child components of a `tablist` explicitly implement `role="tab"` and `aria-selected`.
