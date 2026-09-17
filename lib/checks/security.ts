import { validateProductUrl } from './url-validation';

export function validatePlaywrightTargetUrl(url: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
  const result = validateProductUrl(url);
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error.message,
    };
  }
  return {
    isValid: true,
    normalizedUrl: result.normalizedUrl,
  };
}
