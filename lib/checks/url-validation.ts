import net from 'net';

export interface ValidationSuccess {
  isValid: true;
  normalizedUrl: string;
  parsedUrl: URL;
}

export interface ValidationError {
  isValid: false;
  error: {
    code: 'INVALID_URL';
    message: string;
  };
}

export type ValidationResult = ValidationSuccess | ValidationError;

/**
 * Checks if an IPv4 address belongs to a private, loopback, link-local,
 * or reserved address space (SSRF protection).
 */
export function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed IP
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-local / AWS/GCP/Azure instance metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT: 100.64.0.0 - 100.127.255.255)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 192.0.0.0/24, 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0) return true;

  // 224.0.0.0/4 (Multicast 224-239) & 240.0.0.0/4 (Reserved 240-255)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address is loopback, unique-local, or link-local.
 */
export function isPrivateOrReservedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80:')) return true; // Link-local
  if (normalized.startsWith('fc00:') || normalized.startsWith('fd00:')) return true; // Unique local
  if (normalized.startsWith('::ffff:')) {
    // IPv4-mapped IPv6
    const ipv4Part = normalized.replace('::ffff:', '');
    if (net.isIPv4(ipv4Part)) {
      return isPrivateOrReservedIPv4(ipv4Part);
    }
  }
  return false;
}

/**
 * Validates a user-supplied product URL and enforces SSRF restrictions.
 */
export function validateProductUrl(rawUrl: unknown): ValidationResult {
  if (typeof rawUrl !== 'string') {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  // Must explicitly start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  // Protocol check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  // Reject localhost and internal domains
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.corp') ||
    hostname === 'metadata.google.internal'
  ) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  // Hostname must contain at least one dot unless it's a valid IP
  if (!hostname.includes('.')) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_URL',
        message: 'Enter a valid website URL.',
      },
    };
  }

  // IP literal checks
  if (net.isIPv4(hostname)) {
    if (isPrivateOrReservedIPv4(hostname)) {
      return {
        isValid: false,
        error: {
          code: 'INVALID_URL',
          message: 'Enter a valid website URL.',
        },
      };
    }
  } else if (net.isIPv6(hostname)) {
    if (isPrivateOrReservedIPv6(hostname)) {
      return {
        isValid: false,
        error: {
          code: 'INVALID_URL',
          message: 'Enter a valid website URL.',
        },
      };
    }
  }

  // Normalize URL
  const normalizedUrl = parsed.href;

  return {
    isValid: true,
    normalizedUrl,
    parsedUrl: parsed,
  };
}
