# Palette's Journal - Critical UX/A11y Learnings
## 2024-09-24 - Replace window.confirm with Custom React Dialog
**Learning:** Replacing native `window.confirm` with a custom React dialog (like `ConfirmActionDialog`) improves UX by providing consistent design and allowing exit animations. It requires safely splitting inline logic into two separate `useCallback` hooks (trigger and execution) and mounting the dialog unconditionally in the JSX tree with optional chaining for dynamic props.
**Action:** Always prefer custom dialog components over native browser prompts for destructive actions, splitting the logic into trigger and confirmation handlers.
