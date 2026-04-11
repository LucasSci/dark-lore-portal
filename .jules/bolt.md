## 2024-05-18 - Avoid array spreading in hot loops
**Learning:** In hot functions like `computeVisibilityPolygon` (which may be called multiple times per frame for line-of-sight and lighting calculations), using the spread syntax (`[...walls, ...boundaryWalls]`) to allocate an intermediate array simply for iterating over it creates significant garbage collection (GC) overhead.
**Action:** Always avoid creating intermediate arrays with the spread operator in performance-critical loops. Iterate over the base arrays directly and conditionally push to your target array, or process boundary cases outside the main loop.
## 2024-05-18 - Unnecessary PIXI re-renders on every keystroke
**Learning:** The VTT feature uses a large `useEffect` in `VttPixiStage.tsx` to rebuild the entire PIXI scene graph (thousands of `Graphics` objects for grid cells, fog, tokens, etc.) whenever the board state changes. However, because inline callback functions (`onCellClick`, `onMoveToken`, `onSelectToken`) from the parent component (`MesaPage`) were included in the dependency array, and the `tokens` array was re-computed as a new reference on every render, the entire PIXI graph was destroyed and recreated on *every single keystroke* in the chat or dice inputs.
**Action:** When integrating React with non-React canvas libraries like PIXI, always memoize derived object arrays (like `tokens`) and use the `useRef` pattern for callback functions passed from the parent to avoid triggering expensive rebuilds when the parent re-renders due to unrelated state changes (like text inputs).

## 2026-03-21 - State co-location for high-frequency text inputs
**Learning:** High-frequency state updates like `chatDraft` and `diceDraft` mapped directly in massive parent components (like `MesaPage`) force expensive full-tree React diffs on every keystroke. This causes rendering lag and unnecessarily runs hooks like `useMemo` and function recreating, even with large sub-components like `VttPixiStage` in the tree.
**Action:** Always co-locate high-frequency text input states into their own small components (`ChatInput`, `DiceInput`) that manage their own local `draft` state and pass the finalized value back up to the parent using an `onSend` callback.

## 2025-05-18 - AABB Filtering and Typed Arrays for Dynamic Lighting Raycasting
**Learning:** During 2D raycasting (e.g. `computeVisibilityPolygon`), processing every single map wall during the hot intersection loop results in a massive GC overhead due to `Set` iterations, nested point coordinate lookups, and the volume of vector operations. Simply allocating a new `{x, y}` point for each ray direction and checking distance can significantly lag the canvas rendering.
**Action:** Unroll vector math objects (`{x, y}`) into primitive numbers, inline simple vector math (like Cramer's rule for segment intersection), replace `Set` iterations with pre-allocated typed arrays (like `Float64Array`) for angles/walls, and importantly, utilize an AABB check to entirely filter out distant walls (excluding the map boundary walls) from the loop.

## 2024-04-01 - Chained Array Maps in Polygon Rendering
**Learning:** Chaining `.map().map()` on large coordinate arrays for rendering map polygons (like Leaflet paths) creates intermediate arrays that must be garbage collected, introducing jank during rapid zoom/pan operations. Projecting entire polygons point-by-point just to calculate their bounding box is also an O(n) waste when projecting the bounds directly is O(1).
**Action:** Combine multiple array vector transformations into a single `.map()` pass. Always compute bounds on the unprojected source data first, then project the corners of the bounding box, rather than projecting all vertices.

## 2025-05-18 - Loop Invariant Code Motion (LICM) in Raycasting
**Learning:** During dynamic lighting raycasting, portions of the segment intersection math (like `diffX = ax - ox` or the distance numerator `t_numerator = diffX * dy - diffY * dx`) are entirely dependent on the wall and ray origin, but completely independent of the ray's angle (`dirX`, `dirY`). Calculating these inside the inner ray loop wastes millions of arithmetic operations per frame.
**Action:** Always look for variables that are invariant to the inner loop parameters and precompute them in outer loops. Moving invariant vector math operations outside the raycasting loop into pre-allocated `Float64Arrays` significantly accelerates the hot intersection loop.

## 2025-05-18 - String concatenation vs Map/Join in hot paths
**Learning:** Building cache keys or signatures using `[...].map(x => x.prop).join("|")` inside high-frequency operations (like PIXI rendering or cache invalidation checks) creates significant garbage collection overhead due to the allocation of an intermediate array solely for joining.
**Action:** Replace array `.map().join()` patterns with a standard `for` loop and direct string concatenation (e.g. `str += x.prop + "|"`) in performance critical hot paths to reduce memory allocation.
