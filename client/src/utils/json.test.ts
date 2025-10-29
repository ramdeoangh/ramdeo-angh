import { describe, it, expect } from 'vitest';
import { parseAndValidate, sortObjectKeys } from './json';

describe('json utils', () => {
  it('validates correct JSON', () => {
    const r = parseAndValidate('{"a":1}');
    expect(r.ok).toBe(true);
    expect(r.error).toBeNull();
  });

  it('detects invalid JSON with position', () => {
    const r = parseAndValidate('{"a":}');
    expect(r.ok).toBe(false);
    expect(r.error?.message).toBeTruthy();
  });

  it('sorts object keys deeply', () => {
    const input = { b: 1, a: { d: 2, c: 3 } } as const;
    const r = sortObjectKeys(input);
    expect(Object.keys(r)).toEqual(['a', 'b']);
    expect(Object.keys((r as any).a)).toEqual(['c', 'd']);
  });
});


