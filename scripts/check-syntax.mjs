import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const sourceFiles = (
  await Promise.all(
    ["scripts", "src"].map((directory) =>
      collectModules(resolve(repositoryRoot, directory))
    )
  )
).flat().sort();

for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit"
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}

async function collectModules(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectModules(path));
    } else if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(path);
    }
  }
  return files;
}
