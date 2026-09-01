# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-24 - Replace window.confirm with ConfirmActionDialog
**Learning:** Native window.confirm blocks the main thread, lacks styling consistency with the design system, and provides a poor accessible experience. Using a custom AlertDialog ensures consistent UI, proper focus management, and a non-blocking asynchronous confirmation flow.
**Action:** Always use the custom ConfirmActionDialog wrapper for destructive actions instead of native dialogs to maintain design system consistency and a11y standards.
