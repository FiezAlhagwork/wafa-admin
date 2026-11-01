import { isAxiosError } from "axios";
import type { ErrorCode, ErrorResponse } from "./types";

/** Codes the client produces itself, when the server never answered with an error body. */
type ClientErrorCode = "NETWORK_ERROR" | "UNKNOWN_ERROR";

/**
 * Every failed request reaches hooks and components as an ApiError (the client's interceptor converts it).
 * `message` from the server is for developers only and is never shown: user-facing text comes from `code`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode | ClientErrorCode;
  readonly details: Record<string, unknown>;

  constructor(status: number, code: ApiError["code"], details: Record<string, unknown> = {}, message: string = code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  if (typeof data !== "object" || data === null || !("error" in data)) return false;
  const { error } = data;
  return typeof error === "object" && error !== null && "code" in error;
};

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    // No response: offline, server down, CORS (origin missing from the backend's FRONTEND_URLS)
    if (!error.response) return new ApiError(0, "NETWORK_ERROR", {}, error.message);

    const { status, data } = error.response;
    if (isErrorResponse(data)) {
      const { code, message, details } = data.error;
      return new ApiError(status, code, details ?? {}, message);
    }
    return new ApiError(status, status >= 500 ? "SERVER_ERROR" : "UNKNOWN_ERROR", {}, error.message);
  }

  return new ApiError(0, "UNKNOWN_ERROR", {}, error instanceof Error ? error.message : String(error));
}
