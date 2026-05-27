# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-27 - Replace native window.confirm with ConfirmActionDialog
**Learning:** Native `window.confirm` dialogs are visually jarring and disrupt the immersion and custom theming of the application. The project has a dedicated, accessible wrapper `@radix-ui/react-alert-dialog` (`ConfirmActionDialog`) intended specifically for this purpose.
**Action:** When adding or refactoring destructive actions, always use `ConfirmActionDialog` instead of native `window.confirm`. Safely split the action logic into two hooks (one to open the dialog, one to execute the logic upon confirmation) to maintain a clean React component structure and ensure the dialog operates correctly.
