/**
 * Error code registry shared by every admin MCP tool.
 *
 * Codes are stable machine identifiers. Human wording lives in `message`, and
 * the recovery instruction an assistant should act on lives in `guidance`.
 */
export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "INVALID_SLUG",
  "SLUG_EXISTS",
  "TITLE_TOO_LONG",
  "AUTH_REQUIRED",
  "AUTH_EXPIRED",
  "AUTH_FAILED",
  "AUTH_DENIED",
  "GITHUB_UNAVAILABLE",
  "COMMIT_FAILED",
  "POST_NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface OperationErrorOptions {
  /** Input field that caused the failure, when the failure is field-scoped. */
  field?: string;
  /** Exact next step the caller should take. */
  guidance?: string;
  /** Ordered follow-up calls that recover the workflow. */
  nextSteps?: string[];
}

export class OperationError extends Error {
  readonly code: ErrorCode;
  readonly field?: string;
  readonly guidance?: string;
  readonly nextSteps?: string[];

  constructor(code: ErrorCode, message: string, options: OperationErrorOptions = {}) {
    super(message);
    this.name = "OperationError";
    this.code = code;
    this.field = options.field;
    this.guidance = options.guidance;
    this.nextSteps = options.nextSteps;
  }
}

/** Map an unknown thrown value onto the standard error shape. */
export function toOperationError(error: unknown): OperationError {
  if (error instanceof OperationError) return error;
  const message = error instanceof Error ? error.message : String(error);

  if (/rate limit/i.test(message)) {
    return new OperationError("RATE_LIMITED", message, {
      guidance: "Wait for the GitHub rate-limit window to reset, then retry the same call.",
    });
  }
  if (/authoriz|session|expired/i.test(message)) {
    return new OperationError("AUTH_EXPIRED", message, {
      guidance: "Call blog_auth_request to obtain a new session, then retry.",
      nextSteps: ["blog_auth_request", "blog_auth_verify"],
    });
  }
  if (/github/i.test(message)) {
    return new OperationError("GITHUB_UNAVAILABLE", message, {
      guidance: "GitHub rejected or failed the request. Retry once; if it persists, check repository access.",
    });
  }
  return new OperationError("INTERNAL_ERROR", message, {
    guidance: "Retry the call. If the failure repeats, report the message verbatim.",
  });
}
