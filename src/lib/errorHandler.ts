/**
 * Centralized Error Handling & Sanitization Engine
 * Converts raw errors and HTTP responses into clear, production-grade, user-friendly messages.
 */

export function formatErrorMessage(err: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  if (!err) return fallbackMessage;

  // If already a simple string
  if (typeof err === 'string') {
    return sanitizeText(err);
  }

  // If Error instance
  if (err instanceof Error) {
    const msg = err.message || '';

    // Handle Network / Connection Errors
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
      return 'Unable to reach the server. Please check your network connection.';
    }

    // Handle common HTTP error statuses
    if (msg.includes('status: 401') || msg.includes('Unauthorized') || msg.includes('jwt expired')) {
      return 'Your session has expired. Please log in again.';
    }

    if (msg.includes('status: 403') || msg.includes('Forbidden')) {
      return 'Access denied. You do not have permission to perform this action.';
    }

    if (msg.includes('status: 404') || msg.includes('not found') || msg.includes('PGRST116')) {
      return 'The requested resource was not found.';
    }

    if (msg.includes('status: 409') || msg.includes('duplicate key') || msg.includes('23505')) {
      return 'A record with this name or identifier already exists. Please choose a different title or slug.';
    }

    if (msg.includes('status: 500') || msg.includes('Internal server error')) {
      return 'A server error occurred while processing your request. Please try again shortly.';
    }

    // If message is clean and readable, return sanitized version
    if (msg && !msg.startsWith('HTTP error!') && msg.length < 120) {
      return sanitizeText(msg);
    }
  }

  // If object with message or error properties
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as Record<string, any>;
    if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
      return sanitizeText(anyErr.message);
    }
    if (typeof anyErr.error === 'string' && anyErr.error.trim()) {
      return sanitizeText(anyErr.error);
    }
  }

  return fallbackMessage;
}

function sanitizeText(str: string): string {
  // Strip out technical error prefixes or SQL details
  let clean = str
    .replace(/^Error:\s*/i, '')
    .replace(/^HTTP error!\s*/i, '')
    .trim();

  // Capitalize first character
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean;
}
