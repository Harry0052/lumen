/**
 * No language-model adapter is implemented. A key in the environment does not
 * turn a rewrite on, because there is nothing to call.
 */
export function llmRewriteEnabled() {
  return false;
}

export const flags = {
  llmRewrite: false,
  emailDelivery: false,
  smsDelivery: false,
  browserOverlay: false,
  formSubmission: false,
  hostedDatabase: false,
} as const;
