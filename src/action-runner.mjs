import { appendFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

import { generateTopLanguages } from "./generate.mjs";

const DEFAULTS = Object.freeze({
  style: "bars",
  theme: "light",
  top: 6,
  includeArchived: false,
  title: "Most Used Languages",
  width: 400,
  outputDirectory: "assets"
});

export async function runAction({
  env = process.env,
  cwd = process.cwd(),
  fetchImpl = globalThis.fetch,
  sleep,
  logger = console
} = {}) {
  const inputs = readInputs(env, cwd);
  const summary = await generateTopLanguages({
    config: inputs.config,
    outputDirectory: inputs.outputDirectory,
    token: inputs.token,
    fetchImpl,
    sleep,
    logger
  });
  const result = {
    ...summary,
    svgPath: join(inputs.outputDirectory, "top-langs.svg"),
    dataPath: join(inputs.outputDirectory, "top-langs-data.json")
  };

  await appendActionOutputs(env.GITHUB_OUTPUT, {
    "svg-path": result.svgPath,
    "data-path": result.dataPath,
    "repository-count": result.repositoryCount,
    "included-repository-count": result.includedRepositoryCount,
    "language-count": result.languageCount
  });
  return result;
}

function readInputs(env, cwd) {
  const token = input(env, "github-token") || env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("github-token is required");
  }

  const username = input(env, "username") || env.GITHUB_REPOSITORY_OWNER;
  if (!username) {
    throw new Error("username is required outside a GitHub repository context");
  }

  const style = input(env, "style") || DEFAULTS.style;
  if (style !== "bars") {
    throw new Error("style must currently be bars");
  }
  const theme = input(env, "theme") || DEFAULTS.theme;
  if (theme !== "light") {
    throw new Error("theme must currently be light");
  }

  const workspace = resolve(cwd);
  const outputInput = input(env, "output-directory")
    || DEFAULTS.outputDirectory;
  if (/\r|\n/.test(outputInput)) {
    throw new Error("output-directory must be a single-line path");
  }
  const outputDirectory = resolve(workspace, outputInput);
  if (outputDirectory !== workspace
      && !outputDirectory.startsWith(workspace + sep)) {
    throw new Error("output-directory must stay inside the workspace");
  }

  return {
    token,
    outputDirectory,
    config: {
      username,
      top: integerInput(env, "top", DEFAULTS.top),
      includeArchived: booleanInput(
        env,
        "include-archived",
        DEFAULTS.includeArchived
      ),
      excludeRepositories: listInput(env, "exclude-repositories"),
      excludeLanguages: listInput(env, "exclude-languages"),
      title: input(env, "title") || DEFAULTS.title,
      width: integerInput(env, "width", DEFAULTS.width)
    }
  };
}

function input(env, name) {
  const value = env["INPUT_" + name.toUpperCase()];
  return typeof value === "string" ? value.trim() : "";
}

function integerInput(env, name, fallback) {
  const value = input(env, name);
  if (value === "") {
    return fallback;
  }
  if (!/^-?\d+$/.test(value)) {
    throw new TypeError(name + " must be an integer");
  }
  return Number(value);
}

function booleanInput(env, name, fallback) {
  const value = input(env, name).toLowerCase();
  if (value === "") {
    return fallback;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new TypeError(name + " must be true or false");
}

function listInput(env, name) {
  const value = input(env, name);
  if (value === "") {
    return [];
  }
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function appendActionOutputs(outputFile, outputs) {
  if (typeof outputFile !== "string" || outputFile === "") {
    throw new Error("GITHUB_OUTPUT is required when RepoPalette runs as an action");
  }
  const lines = [];
  for (const [name, value] of Object.entries(outputs)) {
    const text = String(value);
    if (/\r|\n/.test(text)) {
      throw new Error("Action output " + name + " must be a single line");
    }
    lines.push(name + "=" + text);
  }
  await appendFile(outputFile, lines.join("\n") + "\n", "utf8");
}
