# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-30 - Replace window.confirm with ConfirmActionDialog
**Learning:** Native `window.confirm` halts the main thread and breaks the application's design system consistency, leading to a jarring user experience.
**Action:** Always use the custom `@radix-ui/react-alert-dialog` wrapper component (`ConfirmActionDialog`) for destructive actions. Split the logic into two separate `useCallback` hooks (one for opening, one for confirming) and unconditionally mount the dialog at the bottom of the component tree, using optional chaining for dynamic content to prevent runtime errors when the underlying data is deleted.
