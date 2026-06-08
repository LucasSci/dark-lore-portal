# Palette's Journal - Critical UX/A11y Learnings

## 2026-06-08 - Tablist Children Accessibility
**Learning:** When using `role="tablist"` on a container, its interactive children must explicitly have `role="tab"` and an `aria-selected` attribute to be properly parsed by screen readers.
**Action:** Always verify that custom tab components pair `tablist` containers with `tab` roles and selection states on children.
