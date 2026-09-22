## 2024-05-18 - Missing Accessibility on Icon-only Canvas Controls
**Learning:** VTT (Virtual Tabletop) and Map interfaces often have floating controls (like zoom, reset, or token HP adjusters) that developers forget to label because the context seems "obvious" visually on the canvas. Screen readers and users relying on explicit hover tooltips are left without context for these actions.
**Action:** Always ensure that floating map controls and icon-only token adjusters have explicit `title` and `aria-label` attributes to provide clear intent for all users.
## 2024-05-18 - Graceful Modal Exits
**Learning:** When replacing native block APIs (like `window.confirm`) with React state-driven Modals inside components that also handle state deletion, the Modal component can crash during its exit animation if the underlying parent state (like `activeProject`) becomes null upon confirmation.
**Action:** Always conditionally reference changing parent state (e.g., `activeProject?.title`) inside dialog components and mount the dialog unconditionally to avoid runtime null reference errors during Framer Motion exit transitions.
