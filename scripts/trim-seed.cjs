const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../src/db/seed.ts");
const lines = fs.readFileSync(file, "utf8").split("\n");

// Keep only up to and including the first `main().catch(console.error);`
const cutIndex = lines.findIndex(
  (l) => l.trim() === "main().catch(console.error);",
);
if (cutIndex === -1) {
  console.error("Could not find main().catch line");
  process.exit(1);
}

const trimmed = lines.slice(0, cutIndex + 1).join("\n") + "\n";
fs.writeFileSync(file, trimmed, "utf8");
console.log(`Trimmed to ${cutIndex + 1} lines.`);
