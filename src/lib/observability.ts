type FailureLog = {
  scope: string;
  code: string;
  detail?: string;
};

/** Server log for failures. Do not pass notes, tokens, or guide answers. */
export function logFailure(entry: FailureLog) {
  console.error(
    JSON.stringify({
      source: "lumen",
      scope: entry.scope,
      code: entry.code,
      detail: entry.detail?.slice(0, 180) ?? null,
      at: new Date().toISOString(),
    }),
  );
}
