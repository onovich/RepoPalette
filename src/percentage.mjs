export function percentageOf(bytes, totalBytes) {
  if (totalBytes === 0) {
    return 0;
  }
  return Math.round((bytes / totalBytes * 100) * 10_000) / 10_000;
}
