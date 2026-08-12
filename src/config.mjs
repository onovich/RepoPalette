import { STYLE_NAMES, THEME_NAMES } from "./presentation.mjs";

const DEFAULT_CONFIG = Object.freeze({
  top: 6,
  includeArchived: false,
  excludeRepositories: [],
  excludeLanguages: [],
  title: "Most Used Languages",
  width: 400,
  style: "bars",
  theme: "light"
});

export function validateConfig(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("configuration must be a JSON object");
  }

  const knownKeys = new Set(["username", ...Object.keys(DEFAULT_CONFIG)]);
  for (const key of Object.keys(input)) {
    if (!knownKeys.has(key)) {
      throw new TypeError("unknown configuration key: " + key);
    }
  }

  const config = {
    username: input.username,
    top: input.top ?? DEFAULT_CONFIG.top,
    includeArchived: input.includeArchived ?? DEFAULT_CONFIG.includeArchived,
    excludeRepositories: input.excludeRepositories
      ?? DEFAULT_CONFIG.excludeRepositories,
    excludeLanguages: input.excludeLanguages ?? DEFAULT_CONFIG.excludeLanguages,
    title: input.title ?? DEFAULT_CONFIG.title,
    width: input.width ?? DEFAULT_CONFIG.width,
    style: input.style ?? DEFAULT_CONFIG.style,
    theme: input.theme ?? DEFAULT_CONFIG.theme
  };

  if (typeof config.username !== "string" || config.username.trim() === "") {
    throw new TypeError("username must be a non-empty string");
  }
  if (!Number.isInteger(config.top) || config.top < 1 || config.top > 12) {
    throw new TypeError("top must be an integer from 1 to 12");
  }
  if (typeof config.includeArchived !== "boolean") {
    throw new TypeError("includeArchived must be a boolean");
  }
  validateStringArray(config.excludeRepositories, "excludeRepositories");
  validateStringArray(config.excludeLanguages, "excludeLanguages");
  if (typeof config.title !== "string" || config.title.trim() === "") {
    throw new TypeError("title must be a non-empty string");
  }
  if (!Number.isInteger(config.width)
      || config.width < 320
      || config.width > 800) {
    throw new TypeError("width must be an integer from 320 to 800");
  }
  validateChoice(config.style, "style", STYLE_NAMES);
  validateChoice(config.theme, "theme", THEME_NAMES);

  return {
    ...config,
    excludeRepositories: [...config.excludeRepositories],
    excludeLanguages: [...config.excludeLanguages]
  };
}

function validateChoice(value, name, choices) {
  if (!choices.includes(value)) {
    throw new TypeError(name + " must be one of: " + choices.join(", "));
  }
}

function validateStringArray(value, name) {
  if (!Array.isArray(value)
      || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new TypeError(name + " must contain only non-empty strings");
  }
}

