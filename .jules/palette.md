# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-18 - Replace window.confirm with ConfirmActionDialog
**Learning:** Native `window.confirm` blocks the main thread, lacks styling consistency, and doesn't support smooth exit animations for state-driven interactions.
**Action:** Use a custom `ConfirmActionDialog` component unconditionally mounted in the JSX tree, splitting the open logic from the confirm logic to ensure graceful exit animations and safe references to potentially deleted underlying state via optional chaining.
