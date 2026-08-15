import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ReasonCode,
  clearRevocations,
  isRevoked,
  lookupRevocation,
  reasonLabel,
  recordRevocation,
  registerOnCertRevoked,
  type RevocationRecord,
} from './revocation';
import { GlobalBus } from './event-bus';

function rec(overrides: Partial<RevocationRecord> = {}): RevocationRecord {
  return {
    reason: ReasonCode.PrivilegeWithdrawn,
    invalidityTime: 0,
    certHash: 'AAAA',
    certName: '/alice',
    publisher: '/master',
    bootTime: 1,
    seqNum: 1,
    ...overrides,
  };
}

describe('revocation cache', () => {
  beforeEach(clearRevocations)
  afterEach(vi.restoreAllMocks)

  it('records, looks up, and reports revocation by hash', () => {
    recordRevocation(rec({ certHash: 'X' }))
    expect(isRevoked('X')).toBe(true)
    expect(lookupRevocation('X')?.reason).toBe(ReasonCode.PrivilegeWithdrawn)
    expect(isRevoked('UNKNOWN')).toBe(false)
  })

  it('latest-wins on cert hash', () => {
    recordRevocation(rec({ certHash: 'Y', reason: ReasonCode.PrivilegeWithdrawn }))
    recordRevocation(rec({ certHash: 'Y', reason: ReasonCode.CessationOfOperation }))
    expect(lookupRevocation('Y')?.reason).toBe(ReasonCode.CessationOfOperation)
  })

  it('does NOT emit cert-revoked when recording (recursion guard)', () => {
    const spy = vi.spyOn(GlobalBus, 'emit')
    recordRevocation(rec({ certHash: 'Z' }))
    expect(spy.mock.calls.filter(([e]) => e === 'cert-revoked')).toHaveLength(0)
  })
})

describe('registerOnCertRevoked bridge', () => {
  beforeEach(clearRevocations)
  afterEach(vi.restoreAllMocks)

  it('converts snake_case payload to camelCase record and returns unregister', () => {
    const handler = vi.fn()
    const unregister = registerOnCertRevoked(handler)
    expect(typeof unregister).toBe('function')
    GlobalBus.emit('cert-revoked', {
      reason: ReasonCode.KeyCompromise,
      invalidity_time: 42,
      cert_hash: 'Q',
      cert_name: '/bob/KEY/k/v=1',
      publisher: '/m',
      boot_time: 1,
      seq_num: 1,
    })
    expect(handler).toHaveBeenCalledOnce()
    const got = handler.mock.calls[0][0]
    expect(got.reason).toBe(ReasonCode.KeyCompromise)
    expect(got.invalidityTime).toBe(42)
    expect(got.certHash).toBe('Q')
    expect(got.certName).toBe('/bob/KEY/k/v=1')
    unregister()
    GlobalBus.emit('cert-revoked', { reason: 0, invalidity_time: 0, cert_hash: 'X', cert_name: '', publisher: '', boot_time: 0, seq_num: 0 })
    expect(handler).toHaveBeenCalledOnce()
  })
})

describe('reasonLabel', () => {
  it('returns a human-readable string per known code and the fallback for unknown', () => {
    expect(reasonLabel(ReasonCode.KeyCompromise)).toBe('key compromise')
    expect(reasonLabel(ReasonCode.PrivilegeWithdrawn)).toBe('revoked by owner')
    expect(reasonLabel(99)).toBe('reason 99')
  })
})
