# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-23 - Replace window.confirm with React Dialog Component
**Learning:** Native `window.confirm` blocks the main thread, lacks styling flexibility, and presents an unpolished, disruptive experience. Using a React-based custom dialog component (like `ConfirmActionDialog`) maintains design consistency, supports custom labels, and provides a smoother interaction flow.
**Action:** Safely split inline `window.confirm` logic into two `useCallback` hooks: one to trigger the dialog state (`isDeleteDialogOpen(true)`) and another to execute the confirmation logic (`onConfirm`). Ensure the dialog component is explicitly mounted in the JSX tree and conditionally rendered if props rely on potentially null state.
