import { readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const START_MARKER = "<!-- repopalette:start -->";
const END_MARKER = "<!-- repopalette:end -->";

export async function updateProfileReadme({
  workspace,
  username,
  codingMode,
  svgPath,
  manualSvgPath,
  vibeSvgPath
}) {
  const root = resolve(workspace);
  const readmePath = join(root, "README.md");
  const existing = await readOrCreate(readmePath, username);
  const eol = existing.includes("\r\n") ? "\r\n" : "\n";
  const block = buildBlock({
    root,
    codingMode,
    svgPath,
    manualSvgPath,
    vibeSvgPath,
    eol
  });
  const next = replaceOrAppend(existing, block, eol);

  if (next !== existing) {
    await writeFile(readmePath, next, "utf8");
  }
  return readmePath;
}

function buildBlock({
  root,
  codingMode,
  svgPath,
  manualSvgPath,
  vibeSvgPath,
  eol
}) {
  const content = codingMode === "split"
    ? [
        `<img src="${markdownPath(root, manualSvgPath)}" width="49%" alt="Manual Coding language composition">`,
        `<img src="${markdownPath(root, vibeSvgPath)}" width="49%" alt="Vibe Coding language composition">`
      ]
    : [
        `![GitHub language composition](${markdownPath(root, svgPath)})`
      ];
  return [START_MARKER, ...content, END_MARKER].join(eol);
}

function replaceOrAppend(existing, block, eol) {
  const starts = occurrences(existing, START_MARKER);
  const ends = occurrences(existing, END_MARKER);
  const startIndex = existing.indexOf(START_MARKER);
  const endIndex = existing.indexOf(END_MARKER);
  if (starts !== ends
      || starts > 1
      || (starts === 1 && startIndex > endIndex)) {
    throw new Error(
      "README.md must contain one complete, ordered RepoPalette block or none"
    );
  }
  if (starts === 1) {
    return existing.replace(
      /<!-- repopalette:start -->[\s\S]*?<!-- repopalette:end -->/,
      block
    );
  }

  let separator = "";
  if (existing !== "" && !existing.endsWith(eol + eol)) {
    separator = existing.endsWith(eol) ? eol : eol + eol;
  }
  return existing + separator + block + eol;
}

function markdownPath(root, filePath) {
  if (typeof filePath !== "string" || filePath === "") {
    throw new Error("A generated SVG path is required to update README.md");
  }
  const absolute = resolve(filePath);
  const path = relative(root, absolute);
  if (path === "" || path === ".." || path.startsWith(".." + sep)) {
    throw new Error("Generated SVG paths must stay inside the workspace");
  }
  return "./" + path.split(sep).map(encodePathSegment).join("/");
}

function encodePathSegment(segment) {
  return encodeURIComponent(segment).replace(
    /[!'()*]/g,
    (character) => "%" + character.charCodeAt(0).toString(16).toUpperCase()
  );
}

async function readOrCreate(path, username) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
    return `# ${username}\n`;
  }
}

function occurrences(value, needle) {
  return value.split(needle).length - 1;
}
