import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, "app");
const routes = [
  "/", "/support", "/support/issues", "/support/helpdesk", "/resources", "/resources/browse",
  "/opportunities", "/opportunities/browse", "/scholarships", "/aashraya", "/aashraya/camps",
  "/sahayi", "/samskara", "/samskara/events", "/samskara/competitions", "/samskara/gallery",
  "/samskara/magazine", "/samskara/volunteers", "/updates", "/search", "/sign-in", "/register",
  "/notifications", "/design-system"
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

if (process.argv.includes("--static")) {
  const offenders = walk(appDir)
    .filter((file) => file.endsWith(".tsx"))
    .filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      return source.includes("PageShell") && /<main\b/.test(source);
    });
  if (offenders.length) {
    console.error("PageShell files must not render their own <main>:");
    for (const file of offenders) console.error(path.relative(root, file));
    process.exit(1);
  }
  console.log("Static landmark check passed.");
  process.exit(0);
}

const base = "http://localhost:3000";
let failed = false;
for (const route of routes) {
  const response = await fetch(base + route, { redirect: "follow" });
  const html = await response.text();
  const mains = (html.match(/<main\b/g) || []).length;
  const ids = (html.match(/id="main-content"/g) || []).length;
  const skips = (html.match(/href="#main-content"/g) || []).length;
  if (mains !== 1 || ids !== 1 || skips < 1) {
    failed = true;
    console.error(`${route}: main=${mains} main-content=${ids} skip=${skips} status=${response.status}`);
  } else {
    console.log(`${route}: 1`);
  }
}
if (failed) process.exit(1);
