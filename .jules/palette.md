## 2024-06-16 - Replacing native window.confirm with ConfirmActionDialog
**Learning:** Native `window.confirm` dialogues block the entire browser thread, providing a jarring and unstyled user experience. Replacing them with the customized Radix `ConfirmActionDialog` integrates destructive action confirmation naturally into the app's design system while preserving accessibility and focus management.
**Action:** Always prefer importing `ConfirmActionDialog` for project deletions and significant destructive actions rather than relying on standard `window.confirm` popups.
