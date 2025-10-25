import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getClasses } from "@/lib/scrapers/ClassSchedulesScraper";

// Allow override via CLI arg: --url=...
const urlArg = process.argv.find(a => a.startsWith("--url="));
const URL = urlArg ? urlArg.slice("--url=".length) : undefined; // TODO: use this URL in getClasses()

async function main() {
  const rows = await getClasses();
  const outDir = path.resolve(process.cwd(), "data");
  const outFile = path.join(outDir, "classes.seed.json");

  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(rows, null, 2), "utf8");

  console.log(`✅ Wrote ${rows.length} rows to ${path.relative(process.cwd(), outFile)}`);
}

main().catch((e) => {
  console.error("Seed failed:", e?.message ?? e);
  process.exit(1);
});