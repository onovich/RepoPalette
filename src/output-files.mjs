import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile
} from "node:fs/promises";
import { join } from "node:path";

import { percentageOf } from "./percentage.mjs";

const AUDIT_KEYS = [
  "schemaVersion",
  "username",
  "repositoryCount",
  "includedRepositoryCount",
  "totalBytes",
  "repositoryScope",
  "languages",
  "classification",
  "filters"
];
const FILTER_KEYS = [
  "includeForks",
  "includeArchived",
  "excludedRepositories",
  "excludedLanguages"
];
const FORBIDDEN_ELEMENTS = new Set([
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "image",
  "use"
]);
const REPOSITORY_EXCLUSION_REASONS = new Set([
  "not-public",
  "fork",
  "archived",
  "configured"
]);

export async function writeValidatedOutputs({
  outputDirectory,
  svg,
  svgs,
  json,
  expectedAudit
}) {
  const svgOutputs = svgs ?? [{ filename: "top-langs.svg", content: svg }];
  validateSvgOutputs(svgOutputs, expectedAudit);
  validateAuditJson(json, expectedAudit);
  await replaceOutputs({ outputDirectory, svgOutputs, json });
  await removeObsoleteSvgOutputs(outputDirectory, svgOutputs);
}

async function removeObsoleteSvgOutputs(outputDirectory, svgOutputs) {
  const currentNames = new Set(svgOutputs.map(({ filename }) => filename));
  const reservedNames = [
    "top-langs.svg",
    "top-langs-manual.svg",
    "top-langs-vibe.svg"
  ];
  // Legacy cleanup is best-effort: a valid new chart must remain successful
  // even when an obsolete file cannot be removed on this runner.
  await Promise.allSettled(
    reservedNames
      .filter((filename) => !currentNames.has(filename))
      .map((filename) => rm(join(outputDirectory, filename), { force: true }))
  );
}

function validateSvgOutputs(outputs, expectedAudit) {
  if (!Array.isArray(outputs) || outputs.length < 1) {
    throw new Error("At least one generated SVG output is required");
  }
  const names = new Set();
  const documents = new Map();
  for (const output of outputs) {
    if (!output || typeof output !== "object"
        || !/^top-langs(?:-(?:manual|vibe))?\.svg$/.test(output.filename)) {
      throw new Error("Generated SVG has an unsupported output filename");
    }
    if (names.has(output.filename)) {
      throw new Error("Generated SVG output filenames must be unique");
    }
    names.add(output.filename);
    documents.set(output.filename, validateSvg(output.content));
  }

  const mode = expectedAudit?.classification?.mode;
  if (mode === "split") {
    if (names.size !== 1 || !names.has("top-langs.svg")) {
      throw new Error("split mode requires the single top-langs SVG output");
    }
    const document = documents.get("top-langs.svg");
    if (document.root.attributes["data-coding-mode"] !== "split") {
      throw new Error('split mode SVG must declare data-coding-mode="split"');
    }
    const populatedGroups = ["manual", "vibe"].filter((group) =>
      expectedAudit.classification.groups[group].totalBytes > 0
    );
    if (populatedGroups.length === 1) {
      validateSingleGroupSvg(document, populatedGroups[0]);
      return;
    }
    for (const group of ["manual", "vibe"]) {
      const groupElements = document.elements.filter(({ attributes }) =>
        attributes["data-role"] === "coding-group"
          && attributes["data-group"] === group
      );
      const overviewElements = document.elements.filter(({ attributes }) =>
        attributes["data-role"] === "coding-overview-part"
          && attributes["data-group"] === group
      );
      if (groupElements.length !== 1 || overviewElements.length !== 1) {
        throw new Error(
          "split mode SVG must contain one " + group
            + " coding group and overview segment"
        );
      }
      const share = Number(
        overviewElements[0].attributes["data-share"]
      );
      const expectedShare = expectedAudit.classification.groups[group]
        .percentage;
      if (!Number.isFinite(share)
          || share < 0
          || share > 100
          || Math.abs(share - expectedShare) > 0.0001) {
        throw new Error(
          group + " overview share does not match the audit"
        );
      }
    }
  } else if (mode === "off") {
    if (names.size !== 1 || !names.has("top-langs.svg")) {
      throw new Error("off mode requires the single top-langs SVG output");
    }
    if (documents.get("top-langs.svg").root.attributes["data-coding-group"]
        !== undefined) {
      throw new Error("off mode SVG must not declare a coding group");
    }
    if (documents.get("top-langs.svg").root.attributes["data-coding-mode"]
        !== undefined) {
      throw new Error("off mode SVG must not declare a coding mode");
    }
  } else {
    throw new Error("Generated SVG outputs require a known classification mode");
  }
}

function validateSingleGroupSvg(document, activeGroup) {
  const { attributes } = document.root;
  if (attributes["data-coding-layout"] !== "single-group"
      || attributes["data-coding-group"] !== activeGroup) {
    throw new Error(
      "single-group SVG must identify the " + activeGroup + " coding group"
    );
  }
  const codingGroups = document.elements.filter(({ attributes: element }) =>
    element["data-role"] === "coding-group"
  );
  const overviewParts = document.elements.filter(({ attributes: element }) =>
    element["data-role"] === "coding-overview-part"
  );
  if (codingGroups.length !== 1
      || codingGroups[0].attributes["data-group"] !== activeGroup
      || overviewParts.length !== 0) {
    throw new Error(
      "single-group SVG must contain only the " + activeGroup
        + " coding group and no overview segments"
    );
  }
}

function validateSvg(svg) {
  if (typeof svg !== "string" || !svg.endsWith("\n")) {
    throw new Error("Generated SVG must be UTF-8 text ending in a newline");
  }
  const document = parseSvg(svg);
  if (/@import\b|url\s*\(/i.test(document.styleText)) {
    throw new Error("Generated SVG contains a forbidden external resource");
  }
  const { attributes } = document.root;
  if (document.root.name !== "svg") {
    throw new Error("Generated SVG root element must be svg");
  }
  if (attributes.role !== "img") {
    throw new Error("Generated SVG is missing its accessible image role");
  }
  if (!document.elementNames.has("title")
      || !document.elementNames.has("desc")) {
    throw new Error("Generated SVG must contain title and desc elements");
  }

  const width = positiveNumber(attributes.width, "width");
  const height = positiveNumber(attributes.height, "height");
  const viewBox = String(attributes.viewBox ?? "")
    .trim()
    .split(/\s+/)
    .map(Number);
  if (viewBox.length !== 4
      || viewBox.some((value) => !Number.isFinite(value))
      || viewBox[0] !== 0
      || viewBox[1] !== 0
      || viewBox[2] !== width
      || viewBox[3] !== height) {
    throw new Error("Generated SVG viewBox must match its width and height");
  }
  return document;
}

function parseSvg(svg) {
  const tokenPattern = /<[^>]*>/g;
  const stack = [];
  const elementNames = new Set();
  const elements = [];
  const styleTextSegments = [];
  let root = null;
  let rootClosed = false;
  let cursor = 0;
  let match;

  while ((match = tokenPattern.exec(svg)) !== null) {
    captureTextSegment(
      svg.slice(cursor, match.index),
      stack,
      styleTextSegments
    );
    const rawTag = match[0];

    if (rawTag.startsWith("</")) {
      const closing = /^<\/([A-Za-z][\w:.-]*)\s*>$/.exec(rawTag);
      if (!closing || stack.pop() !== closing[1]) {
        throw new Error("Generated SVG has mismatched closing elements");
      }
      if (stack.length === 0) {
        rootClosed = true;
      }
    } else {
      if (rootClosed) {
        throw new Error("Generated SVG contains multiple root elements");
      }
      const opening = parseOpeningTag(rawTag);
      const normalizedName = opening.name.toLowerCase();
      if (FORBIDDEN_ELEMENTS.has(normalizedName)) {
        throw new Error(
          "Generated SVG contains forbidden SVG element " + opening.name
        );
      }
      for (const attributeName of Object.keys(opening.attributes)) {
        if (["href", "xlink:href", "src"].includes(attributeName.toLowerCase())) {
          throw new Error("Generated SVG contains a forbidden external attribute");
        }
        if (/url\s*\(/i.test(opening.attributes[attributeName])) {
          throw new Error("Generated SVG contains a forbidden external resource");
        }
      }

      if (root === null) {
        root = opening;
      } else if (stack.length === 0) {
        throw new Error("Generated SVG contains multiple root elements");
      }
      elementNames.add(normalizedName);
      elements.push(opening);
      if (!opening.selfClosing) {
        stack.push(opening.name);
      } else if (stack.length === 0) {
        rootClosed = true;
      }
    }

    cursor = tokenPattern.lastIndex;
  }

  captureTextSegment(svg.slice(cursor), stack, styleTextSegments);
  if (!root || stack.length !== 0 || !rootClosed) {
    throw new Error("Generated SVG is not well-formed XML");
  }
  return {
    root,
    elements,
    elementNames,
    styleText: styleTextSegments.join("")
  };
}

function captureTextSegment(text, stack, styleTextSegments) {
  validateTextSegment(text, stack.length);
  if (stack.at(-1)?.toLowerCase() === "style") {
    styleTextSegments.push(text);
  }
}

function parseOpeningTag(rawTag) {
  if (rawTag.startsWith("<!") || rawTag.startsWith("<?")) {
    throw new Error("Generated SVG contains an unsupported declaration");
  }

  const selfClosing = /\/\s*>$/.test(rawTag);
  let inner = rawTag.slice(1, -1).trim();
  if (selfClosing) {
    inner = inner.slice(0, -1).trimEnd();
  }

  const nameMatch = /^([A-Za-z][\w:.-]*)(?=\s|$)/.exec(inner);
  if (!nameMatch) {
    throw new Error("Generated SVG contains an invalid opening element");
  }

  const name = nameMatch[1];
  const attributes = {};
  let remainder = inner.slice(name.length);
  while (remainder.length > 0) {
    const attribute = /^\s+([A-Za-z_:][\w:.-]*)\s*=\s*"([^"]*)"/
      .exec(remainder);
    if (!attribute) {
      throw new Error("Generated SVG contains invalid attribute syntax");
    }
    if (Object.hasOwn(attributes, attribute[1])) {
      throw new Error("Generated SVG contains a duplicate attribute");
    }
    attributes[attribute[1]] = attribute[2];
    remainder = remainder.slice(attribute[0].length);
  }

  return { name, attributes, selfClosing };
}

function validateTextSegment(text, depth) {
  if (text.includes("<") || text.includes(">")) {
    throw new Error("Generated SVG contains malformed text content");
  }
  if (depth === 0 && text.trim() !== "") {
    throw new Error("Generated SVG contains text outside the root element");
  }
}

function positiveNumber(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0 || number > 10_000) {
    throw new Error("Generated SVG " + name + " must be a positive number");
  }
  return number;
}

function validateAuditJson(json, expectedAudit) {
  let audit;
  try {
    audit = JSON.parse(json);
  } catch (error) {
    throw new Error("Generated audit JSON is not valid JSON", { cause: error });
  }

  requireExactKeys(audit, AUDIT_KEYS, "audit JSON");
  if (audit.schemaVersion !== 3) {
    throw new Error("Generated audit JSON has an unsupported schemaVersion");
  }
  if (typeof audit.username !== "string" || audit.username === "") {
    throw new Error("Generated audit JSON has an invalid username");
  }
  requireNonNegativeInteger(audit.repositoryCount, "repositoryCount");
  requireNonNegativeInteger(
    audit.includedRepositoryCount,
    "includedRepositoryCount"
  );
  if (audit.includedRepositoryCount > audit.repositoryCount) {
    throw new Error(
      "Generated audit JSON includedRepositoryCount exceeds repositoryCount"
    );
  }
  requireNonNegativeInteger(audit.totalBytes, "totalBytes");
  validateRepositoryScope(audit.repositoryScope, audit);
  if (!Array.isArray(audit.languages)) {
    throw new Error("Generated audit JSON languages must be an array");
  }

  let summedBytes = 0;
  const seenLanguages = new Set();
  for (const language of audit.languages) {
    requireExactKeys(
      language,
      ["name", "bytes", "color", "percentage"],
      "language"
    );
    if (typeof language.name !== "string" || language.name === "") {
      throw new Error("Generated audit JSON contains an invalid language name");
    }
    if (seenLanguages.has(language.name)) {
      throw new Error("Generated audit JSON contains duplicate languages");
    }
    seenLanguages.add(language.name);
    requireNonNegativeInteger(language.bytes, "language bytes");
    if (language.bytes === 0) {
      throw new Error("Generated audit JSON contains a zero-byte language");
    }
    if (language.color !== null
        && !/^#[0-9a-f]{6}$/i.test(language.color)) {
      throw new Error("Generated audit JSON contains an invalid language color");
    }
    if (!Number.isFinite(language.percentage)
        || language.percentage < 0
        || language.percentage > 100) {
      throw new Error("Generated audit JSON contains an invalid percentage");
    }

    const expectedPercentage = audit.totalBytes === 0
      ? 0
      : Math.round(
        (language.bytes / audit.totalBytes * 100) * 10_000
      ) / 10_000;
    if (Math.abs(language.percentage - expectedPercentage) > 0.000_001) {
      throw new Error(
        'Language "' + language.name
          + '" percentage does not match its byte share'
      );
    }
    summedBytes += language.bytes;
  }

  if (summedBytes !== audit.totalBytes) {
    throw new Error("Generated audit JSON language bytes do not match totalBytes");
  }
  validateClassification(audit.classification, audit);
  validateFilters(audit.filters);
  compareExpectedAudit(audit, expectedAudit);
}

function validateClassification(classification, audit) {
  requireExactKeys(
    classification,
    ["mode", "source", "manualLanguages", "groups"],
    "classification"
  );
  if (!Array.isArray(classification.manualLanguages)
      || classification.manualLanguages.some((name) =>
        typeof name !== "string" || name === ""
      )
      || new Set(classification.manualLanguages).size
        !== classification.manualLanguages.length) {
    throw new Error("Generated audit JSON has invalid manualLanguages");
  }

  if (classification.mode === "off") {
    if (classification.source !== null
        || classification.groups !== null
        || classification.manualLanguages.length !== 0) {
      throw new Error("Generated audit JSON has invalid disabled classification");
    }
    return;
  }
  if (classification.mode !== "split"
      || classification.source !== "user-declared") {
    throw new Error("Generated audit JSON has invalid classification mode");
  }

  requireExactKeys(classification.groups, ["manual", "vibe"], "coding groups");
  const languageByName = new Map(
    audit.languages.map((language) => [language.name, language])
  );
  const assigned = new Set();
  let groupedBytes = 0;
  for (const groupName of ["manual", "vibe"]) {
    const group = classification.groups[groupName];
    requireExactKeys(
      group,
      ["totalBytes", "percentage", "languages"],
      groupName + " coding group"
    );
    requireNonNegativeInteger(group.totalBytes, groupName + " totalBytes");
    if (!Number.isFinite(group.percentage)
        || group.percentage < 0
        || group.percentage > 100
        || !Array.isArray(group.languages)) {
      throw new Error("Generated audit JSON has invalid " + groupName + " group");
    }
    let languageBytes = 0;
    for (const name of group.languages) {
      const language = languageByName.get(name);
      if (!language || assigned.has(name)) {
        throw new Error("Generated audit JSON has invalid coding group languages");
      }
      const declaredManual = classification.manualLanguages.includes(name);
      if ((groupName === "manual") !== declaredManual) {
        throw new Error("Generated audit JSON contradicts manualLanguages");
      }
      assigned.add(name);
      languageBytes += language.bytes;
    }
    const expectedPercentage = percentageOf(group.totalBytes, audit.totalBytes);
    if (languageBytes !== group.totalBytes
        || Math.abs(group.percentage - expectedPercentage) > 0.000_001) {
      throw new Error("Generated audit JSON coding group totals do not match");
    }
    groupedBytes += group.totalBytes;
  }
  if (groupedBytes !== audit.totalBytes
      || assigned.size !== audit.languages.length) {
    throw new Error("Generated audit JSON coding groups are incomplete");
  }
}

function validateFilters(filters) {
  requireExactKeys(filters, FILTER_KEYS, "audit filters");
  if (filters.includeForks !== false
      || typeof filters.includeArchived !== "boolean") {
    throw new Error("Generated audit JSON contains invalid inclusion filters");
  }
  for (const key of ["excludedRepositories", "excludedLanguages"]) {
    if (!Array.isArray(filters[key])
        || filters[key].some((value) => typeof value !== "string")) {
      throw new Error("Generated audit JSON contains invalid " + key);
    }
  }
}

function validateRepositoryScope(scope, audit) {
  requireExactKeys(scope, ["included", "excluded"], "repositoryScope");
  if (!Array.isArray(scope.included) || !Array.isArray(scope.excluded)) {
    throw new Error("Generated audit JSON repositoryScope must contain arrays");
  }

  const seenNames = new Set();
  for (const name of scope.included) {
    requireRepositoryName(name, seenNames);
  }
  for (const repository of scope.excluded) {
    requireExactKeys(repository, ["name", "reasons"], "excluded repository");
    requireRepositoryName(repository.name, seenNames);
    if (!Array.isArray(repository.reasons)
        || repository.reasons.length === 0
        || repository.reasons.some((reason) =>
          !REPOSITORY_EXCLUSION_REASONS.has(reason)
        )
        || new Set(repository.reasons).size !== repository.reasons.length) {
      throw new Error(
        "Generated audit JSON contains invalid repository exclusion reasons"
      );
    }
  }

  if (scope.included.length !== audit.includedRepositoryCount) {
    throw new Error(
      "Generated audit JSON repositoryScope does not match includedRepositoryCount"
    );
  }
  if (scope.included.length + scope.excluded.length !== audit.repositoryCount) {
    throw new Error(
      "Generated audit JSON repositoryScope does not match repositoryCount"
    );
  }
}

function requireRepositoryName(name, seenNames) {
  if (typeof name !== "string" || name === "") {
    throw new Error("Generated audit JSON contains an invalid repository name");
  }
  if (seenNames.has(name)) {
    throw new Error("Generated audit JSON contains duplicate repositories");
  }
  seenNames.add(name);
}

function compareExpectedAudit(actual, expected) {
  for (const key of [
    "username",
    "repositoryCount",
    "includedRepositoryCount",
    "totalBytes"
  ]) {
    if (actual[key] !== expected[key]) {
      throw new Error("Generated audit JSON " + key + " differs from source data");
    }
  }
  if (JSON.stringify(actual.languages) !== JSON.stringify(expected.languages)
      || JSON.stringify(actual.repositoryScope)
        !== JSON.stringify(expected.repositoryScope)
      || JSON.stringify(actual.classification)
        !== JSON.stringify(expected.classification)
      || JSON.stringify(actual.filters) !== JSON.stringify(expected.filters)) {
    throw new Error("Generated audit JSON differs from source data");
  }
}

function requireExactKeys(value, expectedKeys, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Generated " + name + " must be an object");
  }
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(sortedExpected)) {
    throw new Error("Generated " + name + " has unexpected fields");
  }
}

function requireNonNegativeInteger(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Generated audit JSON " + name + " must be non-negative");
  }
}

async function replaceOutputs({ outputDirectory, svgOutputs, json }) {
  await mkdir(outputDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(join(outputDirectory, ".toplang-"));
  const targets = [
    {
      temporary: join(temporaryDirectory, "top-langs-data.json"),
      destination: join(outputDirectory, "top-langs-data.json"),
      content: json
    },
    ...svgOutputs.map((output) => ({
      temporary: join(temporaryDirectory, output.filename),
      destination: join(outputDirectory, output.filename),
      content: output.content
    }))
  ];

  try {
    for (const target of targets) {
      await writeFile(target.temporary, target.content, "utf8");
      target.previous = await readIfPresent(target.destination);
      target.replaced = false;
    }

    try {
      for (const target of targets) {
        await rename(target.temporary, target.destination);
        target.replaced = true;
      }
    } catch (error) {
      await rollbackOutputs(targets);
      throw error;
    }
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function readIfPresent(path) {
  try {
    return await readFile(path);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function rollbackOutputs(targets) {
  for (const target of targets.filter((item) => item.replaced).reverse()) {
    if (target.previous === null) {
      await rm(target.destination, { force: true });
    } else {
      await writeFile(target.destination, target.previous);
    }
  }
}
