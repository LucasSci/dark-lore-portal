# Palette's Journal - Critical UX/A11y Learnings
## 2024-07-02 - Add missing tab roles and aria-selected
**Learning:** When using role="tablist" on a container, child elements must explicitly have role="tab" and aria-selected to correctly inform screen readers of their state and relationship.
**Action:** Always add role="tab" and aria-selected attributes to interactive elements within a role="tablist".
