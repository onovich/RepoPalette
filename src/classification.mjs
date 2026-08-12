import { percentageOf } from "./percentage.mjs";

export function splitCodingStats(stats, manualLanguages) {
  const manualNames = new Set(manualLanguages);
  const manual = buildGroup(stats, "manual", (language) =>
    manualNames.has(language.name)
  );
  const vibe = buildGroup(stats, "vibe", (language) =>
    !manualNames.has(language.name)
  );

  return {
    manual,
    vibe,
    audit: {
      mode: "split",
      source: "user-declared",
      manualLanguages: [...manualLanguages],
      groups: {
        manual: auditGroup(manual),
        vibe: auditGroup(vibe)
      }
    }
  };
}

export function unclassifiedAudit() {
  return {
    mode: "off",
    source: null,
    manualLanguages: [],
    groups: null
  };
}

function buildGroup(stats, group, predicate) {
  const sourceLanguages = stats.languages.filter(predicate);
  const totalBytes = sourceLanguages.reduce(
    (sum, language) => sum + language.bytes,
    0
  );
  const languages = sourceLanguages.map((language) => ({
    ...language,
    percentage: percentageOf(language.bytes, totalBytes)
  }));
  return {
    ...stats,
    totalBytes,
    languages,
    classification: {
      group,
      source: "user-declared",
      percentageOfTotal: percentageOf(totalBytes, stats.totalBytes)
    }
  };
}

function auditGroup(stats) {
  return {
    totalBytes: stats.totalBytes,
    percentage: stats.classification.percentageOfTotal,
    languages: stats.languages.map((language) => language.name)
  };
}
