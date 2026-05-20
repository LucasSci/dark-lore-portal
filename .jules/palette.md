# Palette's Journal - Critical UX/A11y Learnings
## 2026-05-20 - Replaced window.confirm with Custom ConfirmActionDialog
**Learning:** The application uses a custom `ConfirmActionDialog` UI component instead of native blocking `window.confirm` dialogues for destructive actions to maintain design system consistency.
**Action:** Use `ConfirmActionDialog` wrapper component from `@/components/ui/confirm-action-dialog` for confirmation flows.
