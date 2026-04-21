import fs from 'fs';

const entry = `\n## ${new Date().toISOString().split('T')[0]} - Batching PIXI.js Graphics objects
**Learning:** Creating thousands of individual \`Graphics\` objects for repeated identical shapes (like grid cells, fog cells, or wall segments) in React render loops (e.g., \`VttPixiStage\`) causes massive GC overhead.
**Action:** Always batch identical shapes into a single \`Graphics\` object by appending paths (e.g., \`rect()\`, \`moveTo()\`, \`lineTo()\`, \`circle()\`) inside the loop and calling \`fill()\` and \`stroke()\` once outside the loop.
`;

fs.appendFileSync('.jules/bolt.md', entry);
