/**
 * Maps API error codes to i18n translation keys.
 * Backend may return error in: data.code, data.error, or data.message.
 */

export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'FLOOD_WAIT'
  | 'INVALID_PHONE_NUMBER'
  | 'PHONE_NUMBER_INVALID' // alias
  | 'NO_SESSION_FOUND'
  | 'PHONE_CODE_EXPIRED'
  | 'PHONE_CODE_INVALID'
  | 'INVALID_CODE'
  | 'NOT_AUTHORIZED'
  | 'CHAT_NOT_FOUND';

const ERROR_TO_KEY: Record<string, string> = {
  INVALID_REQUEST: 'errors.api.invalidRequest',
  FLOOD_WAIT: 'errors.api.floodWait',
  INVALID_PHONE_NUMBER: 'errors.api.invalidPhoneNumber',
  PHONE_NUMBER_INVALID: 'errors.api.invalidPhoneNumber',
  NO_SESSION_FOUND: 'errors.api.noSessionFound',
  PHONE_CODE_EXPIRED: 'errors.api.phoneCodeExpired',
  PHONE_CODE_INVALID: 'errors.api.phoneCodeInvalid',
  INVALID_CODE: 'errors.api.phoneCodeInvalid',
  NOT_AUTHORIZED: 'errors.api.notAuthorized',
  CHAT_NOT_FOUND: 'errors.api.chatNotFound',
};

/**
 * Extract error code from API error response.
 * Checks data.code, data.error, data.message (uppercased).
 */
export function getApiErrorCode(err: {
  data?: { code?: string; error?: string; message?: string };
  error?: string;
}): string | null {
  const data = err?.data;
  const code =
    data?.code ?? data?.error ?? (typeof data?.message === 'string' ? data.message : null);
  if (!code || typeof code !== 'string') return null;
  return code.toUpperCase().replace(/\s+/g, '_').trim();
}

/**
 * Get i18n key for an API error code, or null if unknown.
 */
export function getErrorTranslationKey(code: string): string | null {
  const normalized = code.toUpperCase().replace(/\s+/g, '_').trim();
  return ERROR_TO_KEY[normalized] ?? null;
}

type TFunction = (key: string) => string;

/**
 * Get user-facing error message from API error.
 * Uses mapped translation if code is known, otherwise fallback.
 */
export function getApiErrorMessage(
  err: { data?: { code?: string; error?: string; message?: string }; error?: string },
  t: TFunction,
  fallbackKey: string = 'errors.generic'
): string {
  const code = getApiErrorCode(err);
  if (code) {
    const key = getErrorTranslationKey(code);
    if (key) return t(key);
  }
  return t(fallbackKey);
}
