/**
 * Ownly revocation service: in-memory cache of revoked certs plus
 * the snake-case -> camelCase bridge from the Go-side cert-revoked
 * event.
 */

import { GlobalBus } from '@/services/event-bus';

/** Ownly reason codes (RFC 5280 §5.3.1). */
export const ReasonCode = {
  Unspecified: 0,
  KeyCompromise: 1,
  CessationOfOperation: 5,
  PrivilegeWithdrawn: 9,
} as const;

export type ReasonCodeValue = (typeof ReasonCode)[keyof typeof ReasonCode];

export interface RevocationRecord {
  reason: ReasonCodeValue;
  /** RFC 5280 §5.3.2; 0 = "now", or unix-us timestamp. */
  invalidityTime: number;
  /** SHA-256 of the cert wire bytes, base32-encoded (no padding). */
  certHash: string;
  /** Full cert NDN name; empty if the cert is unknown to us. */
  certName: string;
  /** SVS publisher of the revocation record. */
  publisher: string;
  bootTime: number;
  seqNum: number;
}

const revokedByHash = new Map<string, RevocationRecord>();

/**
 * Cache a revocation. State-only: does NOT emit cert-revoked. The
 * Go bridge is the single source of the event, so emitting here
 * would recurse forever on any handler that calls back into the
 * cache.
 */
export function recordRevocation(rec: RevocationRecord): void {
  if (!rec.certHash) return;
  revokedByHash.set(rec.certHash, rec); // latest-wins
}

export function lookupRevocation(certHash: string): RevocationRecord | undefined {
  return revokedByHash.get(certHash);
}

export function isRevoked(certHash: string): boolean {
  return revokedByHash.has(certHash);
}

export function listRevocations(): RevocationRecord[] {
  return Array.from(revokedByHash.values());
}

/** Clear the in-memory cache. Test-only. */
export function clearRevocations(): void {
  revokedByHash.clear();
}

/**
 * Subscribe to Go-side cert-revoked events. Handler receives a
 * camelCase record. Returns an unregister function.
 */
export function registerOnCertRevoked(
  handler: (rec: RevocationRecord) => void,
): () => void {
  const listener = (payload: any) => {
    handler({
      reason: payload.reason as ReasonCodeValue,
      invalidityTime: payload.invalidity_time,
      certHash: payload.cert_hash,
      certName: payload.cert_name,
      publisher: payload.publisher,
      bootTime: payload.boot_time,
      seqNum: payload.seq_num,
    });
  };
  GlobalBus.on('cert-revoked', listener);
  return () => GlobalBus.off('cert-revoked', listener);
}

export function reasonLabel(reason: number): string {
  switch (reason) {
    case ReasonCode.Unspecified: return 'unspecified';
    case ReasonCode.KeyCompromise: return 'key compromise';
    case ReasonCode.CessationOfOperation: return 'cessation of operation';
    case ReasonCode.PrivilegeWithdrawn: return 'revoked by owner';
    default: return `reason ${reason}`;
  }
}
