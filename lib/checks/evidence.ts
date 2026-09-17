import {
  LinkEvidence,
  ButtonEvidence,
  FormEvidence,
  InputFieldEvidence,
  ConsoleMessageEvidence,
  FailedRequestEvidence,
} from './check-store';

export function sanitizeText(text: string | null | undefined, maxLength = 200): string {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength) + '…';
  }
  return cleaned;
}

export function capArray<T>(items: T[], max = 30): T[] {
  return items.slice(0, max);
}

export function sanitizeConsoleMessage(
  msg: string | null | undefined,
  type = 'error'
): ConsoleMessageEvidence {
  return {
    type,
    text: sanitizeText(msg, 300),
  };
}

export function sanitizeFailedRequest(
  url: string,
  method: string,
  status?: number,
  resourceType?: string
): FailedRequestEvidence {
  return {
    url: sanitizeText(url, 250),
    method: method || 'GET',
    status,
    resourceType: resourceType ? sanitizeText(resourceType, 50) : undefined,
  };
}
