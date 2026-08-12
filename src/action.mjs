import { runAction } from "./action-runner.mjs";

try {
  await runAction();
} catch (error) {
  console.error(
    "RepoPalette failed:",
    error instanceof Error ? error.stack : error
  );
  process.exitCode = 1;
}
