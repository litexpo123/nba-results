import { describe, it, expect } from 'vitest';
import { getTeamColors } from './teamColors';

describe('getTeamColors', () => {
  it('returns the expected hex pair for CLE', () => {
    expect(getTeamColors('CLE')).toEqual({ primary: '#860038', secondary: '#FDBB30' });
  });

  it('returns the expected hex pair for NYK', () => {
    expect(getTeamColors('NYK')).toEqual({ primary: '#006BB6', secondary: '#F58426' });
  });

  it('returns the expected hex pair for OKC', () => {
    expect(getTeamColors('OKC')).toEqual({ primary: '#007AC1', secondary: '#EF3B24' });
  });

  it('returns black-on-silver for SAS (chosen for legibility on white)', () => {
    expect(getTeamColors('SAS')).toEqual({ primary: '#000000', secondary: '#C4CED4' });
  });

  it('uppercases the input abbreviation before lookup', () => {
    expect(getTeamColors('cle')).toEqual(getTeamColors('CLE'));
    expect(getTeamColors('sas')).toEqual(getTeamColors('SAS'));
  });

  it('falls back to a defined neutral gray for unknown abbreviations', () => {
    const neutral = { primary: '#6b7280', secondary: '#9ca3af' };
    expect(getTeamColors('XYZ')).toEqual(neutral);
    expect(getTeamColors('')).toEqual(neutral);
  });

  it('returns the same neutral object for every unknown team', () => {
    expect(getTeamColors('XYZ')).toEqual(getTeamColors('ABC'));
  });
});
