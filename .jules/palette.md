# Palette's Journal - Critical UX/A11y Learnings
## 2026-09-12 - Splitting logic for graceful dialogs
**Learning:** When replacing native window.confirm with a custom React dialog component like ConfirmActionDialog in StoryEnginePage, splitting the logic into two hooks (one to open the dialog, one for the confirm action) and mounting the dialog unconditionally allows graceful exit animations and prevents runtime errors when state is deleted.
**Action:** Always split dialog trigger and confirm logic into separate useCallbacks and use optional chaining for props to ensure safe, animated unmounts.
