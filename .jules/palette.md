# Palette's Journal - Critical UX/A11y Learnings
## 2024-06-18 - Replace native window.confirm
**Learning:** The application uses a custom @radix-ui/react-alert-dialog wrapper component (ConfirmActionDialog) for destructive actions, but some older or newly introduced components fallback to native window.confirm.
**Action:** Always replace blocking window.confirm calls with the ConfirmActionDialog component, properly splitting the action logic into two hooks (one for opening, one for confirming) to maintain design system consistency and better accessibility.
