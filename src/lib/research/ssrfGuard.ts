/**
 * ssrfGuard.ts
 * Robust SSRF protection against private IPv4/IPv6, internal hostnames, and malformed URLs.
 */

import net from 'node:net';

export const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
  /^\[?fc00:/i,
  /^\[?fd00:/i,
  /\.(?:local|internal|localhost|lan|home|corp|test|example|invalid)$/i
];

/**
 * Parses numeric/octal/hex/shortened IPv4 address strings into a 32-bit unsigned integer.
 * Handles standard decimal, octal (0177.0.0.1), hex (0x7f000001), dword (2130706433), and shortened (127.1).
 */
export function parseIpv4ToNumber(host: string): number | null {
  const clean = host.trim().replace(/^\[|\]$/g, '');
  if (!clean) return null;

  // Single decimal integer (dword)
  if (/^\d+$/.test(clean)) {
    const val = Number(clean);
    if (!Number.isNaN(val) && val >= 0 && val <= 0xffffffff) {
      return val >>> 0;
    }
  }

  // Single hex integer
  if (/^0x[0-9a-fA-F]+$/i.test(clean)) {
    const val = parseInt(clean, 16);
    if (!Number.isNaN(val) && val >= 0 && val <= 0xffffffff) {
      return val >>> 0;
    }
  }

  // Dotted notation (1 to 4 segments)
  const parts = clean.split('.');
  if (parts.length >= 1 && parts.length <= 4) {
    const numbers: number[] = [];
    for (const part of parts) {
      let num: number;
      if (/^0x[0-9a-fA-F]+$/i.test(part)) {
        num = parseInt(part, 16);
      } else if (/^0[0-7]+$/.test(part)) {
        num = parseInt(part, 8);
      } else if (/^\d+$/.test(part)) {
        num = parseInt(part, 10);
      } else {
        return null;
      }
      if (Number.isNaN(num) || num < 0) return null;
      numbers.push(num);
    }

    if (numbers.length === 1) {
      return numbers[0] <= 0xffffffff ? numbers[0] >>> 0 : null;
    }
    if (numbers.length === 2) {
      if (numbers[0] > 0xff || numbers[1] > 0xffffff) return null;
      return ((numbers[0] << 24) | (numbers[1] & 0xffffff)) >>> 0;
    }
    if (numbers.length === 3) {
      if (numbers[0] > 0xff || numbers[1] > 0xff || numbers[2] > 0xffff) return null;
      return ((numbers[0] << 24) | (numbers[1] << 16) | (numbers[2] & 0xffff)) >>> 0;
    }
    if (numbers.length === 4) {
      if (numbers.some((n) => n > 0xff)) return null;
      return (((numbers[0] << 24) | (numbers[1] << 16) | (numbers[2] << 8) | numbers[3]) >>> 0);
    }
  }

  return null;
}

/**
 * Checks whether an IPv4 numeric representation falls into private, loopback, or reserved subnets.
 */
export function isPrivateIpv4Number(ipNum: number): boolean {
  const o1 = (ipNum >>> 24) & 0xff;
  const o2 = (ipNum >>> 16) & 0xff;

  // 0.0.0.0/8 (Current network)
  if (o1 === 0) return true;

  // 10.0.0.0/8 (Private)
  if (o1 === 10) return true;

  // 100.64.0.0/10 (Shared address space / Carrier-grade NAT)
  if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (o1 === 127) return true;

  // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254)
  if (o1 === 169 && o2 === 254) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (o1 === 192 && o2 === 0) return true;

  // 192.168.0.0/16 (Private)
  if (o1 === 192 && o2 === 168) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (o1 === 198 && (o2 === 18 || o2 === 19)) return true;

  // 224.0.0.0/4 (Multicast) and 240.0.0.0/4 (Reserved)
  if (o1 >= 224) return true;

  return false;
}

/**
 * Checks whether an IPv6 string is private, loopback, link-local, or unique local.
 */
export function isPrivateIpv6(ip: string): boolean {
  const clean = ip.trim().toLowerCase().replace(/^\[|\]$/g, '');

  // IPv4-mapped IPv6 (::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (clean.startsWith('::ffff:') || clean.startsWith('0:0:0:0:0:ffff:')) {
    const mapped = clean.replace(/^(?:0:0:0:0:0:ffff:|::ffff:)/, '');
    if (net.isIP(mapped) === 4) {
      const parsed = parseIpv4ToNumber(mapped);
      if (parsed !== null && isPrivateIpv4Number(parsed)) return true;
    } else if (mapped.includes(':')) {
      const hexParts = mapped.split(':');
      if (hexParts.length === 2) {
        const p1 = parseInt(hexParts[0], 16);
        const p2 = parseInt(hexParts[1], 16);
        if (!Number.isNaN(p1) && !Number.isNaN(p2)) {
          const num = ((p1 << 16) | p2) >>> 0;
          if (isPrivateIpv4Number(num)) return true;
        }
      }
    }
  }

  // Loopback (::1) and Unspecified (::)
  if (clean === '::1' || clean === '::' || clean === '0:0:0:0:0:0:0:1' || clean === '0:0:0:0:0:0:0:0') {
    return true;
  }

  // Link-local: fe80::/10 (fe8, fe9, fea, feb)
  if (/^fe[89ab][0-9a-f]:/i.test(clean) || clean.startsWith('fe80:')) {
    return true;
  }

  // Unique Local Address: fc00::/7 (fc00:: - fdff::)
  if (/^f[cd][0-9a-f]{2}:/i.test(clean)) {
    return true;
  }

  // Multicast: ff00::/8
  if (clean.startsWith('ff')) {
    return true;
  }

  // Documentation: 2001:db8::/32
  if (clean.startsWith('2001:db8:')) {
    return true;
  }

  return false;
}

/**
 * Validates whether an IP address string belongs to private/internal/loopback ranges.
 */
export function isPrivateIp(ip: string): boolean {
  const clean = ip.trim().replace(/^\[|\]$/g, '');

  const ipv4Num = parseIpv4ToNumber(clean);
  if (ipv4Num !== null) {
    return isPrivateIpv4Number(ipv4Num);
  }

  if (net.isIP(clean) === 6 || clean.includes(':')) {
    return isPrivateIpv6(clean);
  }

  return false;
}

/**
 * Validates whether a hostname or IP string belongs to private/internal/loopback address ranges.
 */
export function isPrivateHost(hostname: string): boolean {
  if (!hostname || typeof hostname !== 'string') return true;
  const cleanHost = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');

  if (!cleanHost) return true;

  // Check pattern matches
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(cleanHost))) {
    return true;
  }

  // Check numeric IPv4 representations
  const ipv4Num = parseIpv4ToNumber(cleanHost);
  if (ipv4Num !== null) {
    return isPrivateIpv4Number(ipv4Num);
  }

  // Check IPv6
  if (cleanHost.includes(':')) {
    return isPrivateIpv6(cleanHost);
  }

  // Hostnames without dot (e.g. localhost, router, intranet)
  if (!cleanHost.includes('.')) {
    return true;
  }

  // Disallow trailing dots or internal TLDs
  if (cleanHost.endsWith('.')) {
    return true;
  }

  return false;
}

/**
 * Normalizes and validates a public website URL, filtering out private networks,
 * localhost, invalid schemes, and trailing hashes.
 *
 * @param rawUrl Raw URL input
 * @returns Normalized URL string or null if invalid/disallowed
 */
export function normalizePublicWebsiteUrl(rawUrl: string): string | null {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    // Protocol must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Host must contain a dot or be valid public IP
    if (!host.includes('.') && !host.includes(':')) {
      return null;
    }

    // Must not be private
    if (isPrivateHost(host)) {
      return null;
    }

    // Strip hash and clean up
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Helper to check whether a string is a valid public HTTP/HTTPS URL.
 */
export function isValidPublicHttpUrl(url: string): boolean {
  return Boolean(normalizePublicWebsiteUrl(url));
}

/**
 * Asserts that a URL is a valid, public, safe website URL.
 * Throws an Error if SSRF check fails or URL is invalid.
 */
export function assertSafeUrl(rawUrl: string): string {
  const normalized = normalizePublicWebsiteUrl(rawUrl);
  if (!normalized) {
    throw new Error(`Blocked potentially unsafe or invalid URL for SSRF protection: ${rawUrl}`);
  }
  return normalized;
}
