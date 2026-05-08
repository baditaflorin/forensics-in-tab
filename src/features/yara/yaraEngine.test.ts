import { describe, expect, it } from 'vitest';
import { scanWithYaraSubset } from './yaraEngine';

describe('YARA subset scanner', () => {
  it('matches literal and hex strings', () => {
    const bytes = new TextEncoder().encode('MZ payload http://example.test cmd.exe');
    const result = scanWithYaraSubset(
      `rule Demo {
        strings:
          $mz = { 4D 5A }
          $cmd = "CMD.EXE" nocase
        condition:
          all of them
      }`,
      bytes
    );

    expect(result.errors).toEqual([]);
    expect(result.rules[0]?.matched).toBe(true);
    expect(result.rules[0]?.strings).toHaveLength(2);
  });

  it('evaluates boolean expressions', () => {
    const bytes = new TextEncoder().encode('alpha beta');
    const result = scanWithYaraSubset(
      `rule BooleanRule {
        strings:
          $a = "alpha"
          $b = "gamma"
        condition:
          $a and not $b
      }`,
      bytes
    );

    expect(result.rules[0]?.matched).toBe(true);
  });
});
