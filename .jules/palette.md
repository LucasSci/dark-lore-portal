# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-19 - Explicit Role for Tablist Items
**Learning:** The `V2FilterTabs` component used `role="tablist"` on the container but omitted `role="tab"` and explicit `aria-selected` tracking on the child `<button>` elements, relying purely on visual `data-active` attributes, causing screen readers to misinterpret the tab interface.
**Action:** When implementing custom tablists, always ensure child elements explicitly receive `role="tab"` and track active state via `aria-selected={condition}` to comply with WCAG ARIA authoring practices.
