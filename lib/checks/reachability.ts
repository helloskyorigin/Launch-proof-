import dns from 'dns/promises';
import net from 'net';
import { isPrivateOrReservedIPv4, isPrivateOrReservedIPv6 } from './url-validation';

export interface ReachabilitySuccess {
  isReachable: true;
  finalUrl: string;
  statusCode: number;
  responseTimeMs: number;
}

export interface ReachabilityError {
  isReachable: false;
  statusCode?: number;
  error: {
    code: 'WEBSITE_UNREACHABLE' | 'WEBSITE_ERROR' | 'REQUEST_TIMEOUT';
    message: string;
  };
}

export type ReachabilityResult = ReachabilitySuccess | ReachabilityError;

const REQUEST_TIMEOUT_MS = 12000; // 12 seconds

/**
 * Checks if a given IP address is private/internal
 */
function isInternalIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return isPrivateOrReservedIPv4(ip);
  }
  if (net.isIPv6(ip)) {
    return isPrivateOrReservedIPv6(ip);
  }
  return true;
}

/**
 * Performs a real server-side reachability check on a normalized URL.
 */
export async function checkUrlReachability(targetUrl: string): Promise<ReachabilityResult> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      isReachable: false,
      error: {
        code: 'WEBSITE_UNREACHABLE',
        message: "We couldn't reach this website. Check the URL and try again.",
      },
    };
  }

  // 1. DNS Resolution & SSRF check on resolved IP
  try {
    const lookupResult = await dns.lookup(parsed.hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      return {
        isReachable: false,
        error: {
          code: 'WEBSITE_UNREACHABLE',
          message: "We couldn't reach this website. Check the URL and try again.",
        },
      };
    }

    // Verify all resolved addresses are public IPs
    for (const record of lookupResult) {
      if (isInternalIp(record.address)) {
        return {
          isReachable: false,
          error: {
            code: 'WEBSITE_UNREACHABLE',
            message: "We couldn't reach this website. Check the URL and try again.",
          },
        };
      }
    }
  } catch (dnsErr: any) {
    if (dnsErr?.code === 'ENOTFOUND' || dnsErr?.code === 'EAI_AGAIN') {
      return {
        isReachable: false,
        error: {
          code: 'WEBSITE_UNREACHABLE',
          message: "We couldn't reach this website. Check the URL and try again.",
        },
      };
    }
    // If DNS lookup throws other errors, continue to fetch or report unreachable
  }

  // 2. Perform Real HTTP Request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startTime = performance.now();

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 LaunchProof/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Math.round(performance.now() - startTime);

    // Guard against redirect to internal resource
    if (response.url) {
      try {
        const finalParsed = new URL(response.url);
        if (
          finalParsed.hostname === 'localhost' ||
          finalParsed.hostname.endsWith('.localhost') ||
          finalParsed.hostname.endsWith('.internal') ||
          finalParsed.hostname.endsWith('.local')
        ) {
          return {
            isReachable: false,
            error: {
              code: 'WEBSITE_UNREACHABLE',
              message: "We couldn't reach this website. Check the URL and try again.",
            },
          };
        }
      } catch {
        // Ignored
      }
    }

    const status = response.status;

    // Normal successful responses
    if (status >= 200 && status < 400) {
      return {
        isReachable: true,
        finalUrl: response.url || targetUrl,
        statusCode: status,
        responseTimeMs,
      };
    }

    // 5xx Server Error
    if (status >= 500) {
      return {
        isReachable: false,
        statusCode: status,
        error: {
          code: 'WEBSITE_ERROR',
          message: "The website returned an error and couldn't be checked.",
        },
      };
    }

    // 4xx Client Error (e.g. 404, 403, 401)
    return {
      isReachable: false,
      statusCode: status,
      error: {
        code: 'WEBSITE_UNREACHABLE',
        message: "We couldn't reach this website. Check the URL and try again.",
      },
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Timeout
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return {
        isReachable: false,
        error: {
          code: 'REQUEST_TIMEOUT',
          message: 'The website took too long to respond.',
        },
      };
    }

    // Connection errors
    return {
      isReachable: false,
      error: {
        code: 'WEBSITE_UNREACHABLE',
        message: "We couldn't reach this website. Check the URL and try again.",
      },
    };
  }
}
