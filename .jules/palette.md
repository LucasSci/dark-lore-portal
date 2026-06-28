# Palette's Journal - Critical UX/A11y Learnings
## 2025-01-20 - Custom ConfirmActionDialog usage
**Learning:** Replaced native window.confirm with ConfirmActionDialog to maintain design system consistency, ensure accessibility, and prevent blocking the main thread during user interactions.
**Action:** Use ConfirmActionDialog for any destructive actions requiring user confirmation, splitting the trigger and action into two distinct useCallback hooks.
