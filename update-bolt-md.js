const fs = require('fs');
const filePath = '.jules/bolt.md';

let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

const newEntry = `
## 2024-05-18 - Avoid array spreading in hot loops
**Learning:** In hot functions like \`computeVisibilityPolygon\` (which may be called multiple times per frame for line-of-sight and lighting calculations), using the spread syntax (\`[...walls, ...boundaryWalls]\`) to allocate an intermediate array simply for iterating over it creates significant garbage collection (GC) overhead.
**Action:** Always avoid creating intermediate arrays with the spread operator in performance-critical loops. Iterate over the base arrays directly and conditionally push to your target array, or process boundary cases outside the main loop.
`;

fs.writeFileSync(filePath, newEntry + content);
console.log('Updated .jules/bolt.md');
