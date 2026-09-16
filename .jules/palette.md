# Palette's Journal - Critical UX/A11y Learnings

## 2024-05-24 - Replace window.confirm with ConfirmActionDialog
**Learning:** The application has a custom `@radix-ui/react-alert-dialog` wrapper component (`ConfirmActionDialog`) to maintain design system consistency. When replacing `window.confirm`, splitting the action into two `useCallback` hooks (one to open, one to confirm) and mounting unconditionally using optional chaining for properties like `activeProject?.title` prevents runtime errors and allows graceful exit animations.
**Action:** Always use `ConfirmActionDialog` instead of native `window.confirm` for destructive actions. Splitting the logic and using optional chaining ensures stability when the underlying state is deleted.
