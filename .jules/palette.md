# Palette's Journal - Critical UX/A11y Learnings
## 2024-05-24 - [Replace window.confirm with ConfirmActionDialog]
**Learning:** Replaced inaccessible inline window.confirm with custom React dialog component to maintain consistency and accessibility.
**Action:** Splitting action logic into two distinct hooks handles state safely. Unconditional mounting with optional chaining on the current project's title enables a graceful exit animation and avoids runtime errors when the state is removed.
