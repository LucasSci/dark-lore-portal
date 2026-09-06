# Palette's Journal - Critical UX/A11y Learnings

## 2024-05-24 - Replace window.confirm with ConfirmActionDialog
**Learning:** Native window.confirm blocks the main thread, cannot be styled or animated, and lacks accessibility features. Custom dialog components are necessary for maintaining design system consistency and graceful exit animations.
**Action:** Use ConfirmActionDialog and safely split inline logic into an open handler and an onConfirm handler, mounting unconditionally.
