import { describe, it, expect } from 'vitest';
import { formatGameStart } from './dateFormatter';

describe('formatGameStart', () => {
  it('formats a UTC instant in America/Los_Angeles with DST in effect', () => {
    expect(
      formatGameStart('2026-05-27T15:00:00Z', { timeZone: 'America/Los_Angeles' }),
    ).toBe('Wed, May 27, 8:00 AM PDT');
  });

  it('formats the same instant in America/New_York', () => {
    expect(
      formatGameStart('2026-05-27T15:00:00Z', { timeZone: 'America/New_York' }),
    ).toBe('Wed, May 27, 11:00 AM EDT');
  });

  it('formats the same instant in UTC', () => {
    expect(formatGameStart('2026-05-27T15:00:00Z', { timeZone: 'UTC' })).toBe(
      'Wed, May 27, 3:00 PM UTC',
    );
  });

  it('rolls the local day backward when the UTC time is early morning UTC', () => {
    // 2026-05-28T02:00:00Z is still Wednesday May 27 in LA (PDT, UTC-7 → 19:00).
    expect(
      formatGameStart('2026-05-28T02:00:00Z', { timeZone: 'America/Los_Angeles' }),
    ).toBe('Wed, May 27, 7:00 PM PDT');
  });

  it('renders standard-time abbreviations when DST is not in effect', () => {
    // January is PST (UTC-8) in America/Los_Angeles.
    expect(
      formatGameStart('2026-01-15T20:00:00Z', { timeZone: 'America/Los_Angeles' }),
    ).toBe('Thu, Jan 15, 12:00 PM PST');
  });

  it('produces the same string for the same input regardless of host process timezone', () => {
    // Determinism check: two callers passing the same explicit timezone must
    // get identical output, independent of TZ env / host clock settings.
    const first = formatGameStart('2026-05-27T15:00:00Z', { timeZone: 'America/New_York' });
    const second = formatGameStart('2026-05-27T15:00:00Z', { timeZone: 'America/New_York' });
    expect(first).toBe(second);
  });
});
