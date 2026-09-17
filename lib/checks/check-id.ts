import crypto from 'crypto';

/**
 * Generates a unique check ID in the format chk_<unique-id>
 */
export function createCheckId(): string {
  const randomPart = crypto.randomBytes(4).toString('hex');
  const timestampPart = Date.now().toString(36).slice(-4);
  return `chk_${randomPart}${timestampPart}`;
}
