// Fails when site copy contains an em or en dash; the site writes "to" and commas instead.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src", "public"];
const dashes = /[–—]/;
const hits = [];

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx?|css|mjs|txt|md)$/.test(name)) {
      readFileSync(path, "utf8")
        .split("\n")
        .forEach((line, i) => dashes.test(line) && hits.push(`${path}:${i + 1}`));
    }
  }
};

roots.forEach(walk);
if (hits.length) {
  console.error(`Dashes found:\n${hits.join("\n")}`);
  process.exit(1);
}
