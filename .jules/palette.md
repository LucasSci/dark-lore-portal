# Palette's Journal - Critical UX/A11y Learnings
## 2024-09-08 - Replace native window.confirm
**Learning:** Native `window.confirm` halts thread execution, interrupts screen readers unexpectedly, and cannot be styled to match the design system, leading to a jarring user experience for destructive actions.
**Action:** Always replace `window.confirm` with the `ConfirmActionDialog` component for better accessibility, styling consistency, and graceful animations.
