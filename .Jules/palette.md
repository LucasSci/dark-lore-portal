# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2024-05-21 - Use aria-expanded instead of dynamic aria-label on toggles
**Learning:** Screen readers support state natively via aria-expanded and aria-pressed attributes. Changing aria-label dynamically isn't optimal for A11y.
**Action:** Replaced dynamic aria-labels on toggle buttons in Header and MesaPage with static labels plus aria-expanded/aria-pressed attributes.
