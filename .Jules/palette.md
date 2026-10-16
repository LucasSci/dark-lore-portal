# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-20 - Replace window.confirm with ConfirmActionDialog
**Learning:** window.confirm blocks the main thread, lacks styling flexibility and is poor for accessibility. Native dialog components provide better screen reader support and focus management.
**Action:** Replaced window.confirm with ConfirmActionDialog for project deletion to improve a11y and UX consistency.
## 2026-10-16 - Accessible Menu Toggle Buttons
**Learning:** Dynamically changing the `aria-label` of a toggle button (e.g., "Abrir navegacao" to "Fechar navegacao") can confuse screen reader users by changing the control's name. Native accessibility relies on the `aria-expanded` attribute to communicate state while maintaining a consistent name.
**Action:** Replaced dynamic `aria-label` texts on menu/panel toggle buttons with static descriptive labels and added `aria-expanded` to natively communicate their open/closed state.
