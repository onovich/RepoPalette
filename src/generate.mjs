import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { aggregateLanguages } from "./aggregate.mjs";
import { splitCodingStats, unclassifiedAudit } from "./classification.mjs";
import { validateConfig } from "./config.mjs";
import { fetchAllRepositories } from "./github-client.mjs";
import { writeValidatedOutputs } from "./output-files.mjs";
import { renderSplitSvg } from "./render-split-svg.mjs";
import { renderSvg } from "./render-svg.mjs";

export async function generateTopLanguages({
  config: configInput,
  configPath = resolve("repopalette.config.json"),
  outputDirectory = resolve("assets"),
  token,
  fetchImpl = globalThis.fetch,
  sleep,
  logger = console
} = {}) {
  if (typeof token !== "string" || token === "") {
    throw new Error("GITHUB_TOKEN is required");
  }

  const config = configInput === undefined
    ? await readConfig(configPath)
    : validateConfig(configInput);
  const { repositories, meta } = await fetchAllRepositories({
    username: config.username,
    token,
    fetchImpl,
    sleep,
    logger
  });

  if (repositories.length !== meta.reportedRepositoryCount) {
    throw new Error(
      "GitHub reported " + meta.reportedRepositoryCount
        + " repositories but pagination returned " + repositories.length
    );
  }

  const stats = aggregateLanguages(repositories, config);
  const rendered = renderOutputs(stats, config);
  const audit = buildAudit(stats, config, rendered.classification);
  const json = JSON.stringify(audit, null, 2) + "\n";

  await writeValidatedOutputs({
    outputDirectory,
    svgs: rendered.svgs,
    json,
    expectedAudit: audit
  });

  const summary = {
    repositoryCount: stats.repositoryCount,
    includedRepositoryCount: stats.includedRepositoryCount,
    languageCount: stats.languages.length,
    pageCount: meta.pageCount,
    outputFiles: rendered.outputFiles
  };
  logger.info(
    "Generated " + rendered.svgs.length + " top languages "
      + (rendered.svgs.length === 1 ? "card" : "cards") + " from "
      + summary.includedRepositoryCount + "/" + summary.repositoryCount
      + " repositories across " + summary.pageCount + " API page(s)."
  );
  return summary;
}

function renderOutputs(stats, config) {
  if (config.codingMode === "split") {
    const groups = splitCodingStats(stats, config.manualLanguages);
    return {
      classification: groups.audit,
      svgs: [{
        filename: "top-langs.svg",
        content: renderSplitSvg(groups, config)
      }],
      outputFiles: {
        svg: "top-langs.svg",
        manualSvg: "",
        vibeSvg: ""
      }
    };
  }

  return {
    classification: unclassifiedAudit(),
    svgs: [{
      filename: "top-langs.svg",
      content: renderSvg(stats, config)
    }],
    outputFiles: {
      svg: "top-langs.svg",
      manualSvg: "",
      vibeSvg: ""
    }
  };
}

async function readConfig(configPath) {
  let input;
  try {
    input = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    throw new Error(
      'Unable to read configuration "' + configPath + '": ' + error.message,
      { cause: error }
    );
  }
  return validateConfig(input);
}

function buildAudit(stats, config, classification) {
  return {
    schemaVersion: 3,
    username: config.username,
    repositoryCount: stats.repositoryCount,
    includedRepositoryCount: stats.includedRepositoryCount,
    totalBytes: stats.totalBytes,
    repositoryScope: stats.repositoryScope,
    languages: stats.languages,
    classification,
    filters: {
      includeForks: false,
      includeArchived: config.includeArchived,
      excludedRepositories: [...config.excludeRepositories],
      excludedLanguages: [...config.excludeLanguages]
    }
  };
}
