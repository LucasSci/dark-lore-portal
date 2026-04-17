## 2024-05-24 - Batching PIXI.js Graphics shapes
**Learning:** In React component render loops building a PIXI.js canvas (e.g. `VttPixiStage`), creating thousands of individual `Graphics` objects for repeated identical shapes (like fog cells or grid lines) causes severe garbage collection overhead and bloats the scene graph.
**Action:** When drawing many identical static shapes, instantiate a single `Graphics` object outside the loop, append shapes (like `rect()`) inside the loop, and apply `fill()` and `stroke()` exactly once outside the loop.
