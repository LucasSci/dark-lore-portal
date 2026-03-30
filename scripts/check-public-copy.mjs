import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const targets = [
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/lib/archive-reference.ts",
  "src/pages/HomePage.tsx",
  "src/pages/UniversePage.tsx",
  "src/pages/CampaignPage.tsx",
  "src/pages/MapaPage.tsx",
  "src/pages/PlayPage.tsx",
  "src/pages/OraclePage.tsx",
  "src/pages/ContactPage.tsx",
  "index.html",
];

const bannedPatterns = [
  /\bdemo\b/i,
  /\bmock\b/i,
  /\bprototype\b/i,
  /Dark Lore Portal/i,
  /portal AAA/i,
  /arquivo vivo cinematograf/i,
  /pe[cç]a de palco/i,
  /carta entra como pe[cç]a de cena/i,
];

const findings = [];

for (const relativePath of targets) {
  const absolutePath = path.join(rootDir, relativePath);

  if (!fs.existsSync(absolutePath)) {
    findings.push(`${relativePath}: arquivo nao encontrado`);
    continue;
  }

  const content = fs.readFileSync(absolutePath, "utf8");

  bannedPatterns.forEach((pattern) => {
    const match = content.match(pattern);

    if (match) {
      findings.push(`${relativePath}: termo bloqueado encontrado -> "${match[0]}"`);
    }
  });
}

if (findings.length) {
  console.error("Falha na checagem de copy publica:\n");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("Copy publica verificada com sucesso.");
