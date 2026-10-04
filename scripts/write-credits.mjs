// Writes CREDITS.md from the seed data. Run: node scripts/write-credits.mjs
import fs from 'node:fs';
import { INITIAL_RECIPES } from '../src/data/initialRecipes.js';

const rows = INITIAL_RECIPES.map((r) =>
  `| ${r.title} | [TheMealDB entry](${r.mealDbUrl}) | ${r.image} | ${r.sourceUrl === r.mealDbUrl ? 'n/a' : `[${r.sourceAttribution}](${r.sourceUrl})`} |`
).join('\n');

fs.writeFileSync(new URL('../CREDITS.md', import.meta.url), `# Image and recipe credits

All food photographs and the seed recipes (ingredients and instructions) come from
[TheMealDB](https://www.themealdb.com), a community-contributed recipe database. Photos are loaded
from TheMealDB's servers and are not re-hosted in this repository. Each recipe links back to its
TheMealDB entry and, where TheMealDB lists one, the original publisher.

TheMealDB's free API (test key \`1\`) is intended for development and education. Check
https://www.themealdb.com/api.php for the current terms before a public or commercial launch.

| Recipe | TheMealDB | Photo URL | Original source |
|---|---|---|---|
${rows}

## Removed images

The seven JPEGs previously in \`public/images/\` carried C2PA content credentials marking them as
AI-generated (IPTC digital source type \`trainedAlgorithmicMedia\`). They were removed from the
landing page, the recipe form and the sample data. They remain available in git history only.
`);
console.log('CREDITS.md written');
