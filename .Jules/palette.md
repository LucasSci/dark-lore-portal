# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2024-10-02 - Add aria-pressed to custom filter tabs
**Learning:** When building custom filter components using generic buttons instead of native radio inputs or `role="tab"` structures, screen readers fail to announce which filter is currently active if relying solely on visual CSS classes. Adding `aria-pressed` programmatically surfaces the active filter state to assistive technologies.
**Action:** Always include `aria-pressed` on button-based filter lists or toggles to ensure accessible state communication.
