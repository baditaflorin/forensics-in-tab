import { bytesToHex, collectPatternOffsets } from '../../lib/bytes';
import { evaluateBooleanExpression } from './condition';

export interface YaraStringPattern {
  id: string;
  kind: 'literal' | 'hex' | 'regex';
  source: string;
  nocase: boolean;
  bytes?: (number | null)[];
  regex?: RegExp;
}

export interface YaraRule {
  name: string;
  strings: YaraStringPattern[];
  condition: string;
}

export interface YaraStringMatch {
  id: string;
  offsets: number[];
  sample: string;
}

export interface YaraRuleMatch {
  rule: string;
  matched: boolean;
  strings: YaraStringMatch[];
  condition: string;
}

export interface YaraScanResult {
  rules: YaraRuleMatch[];
  errors: string[];
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function scanWithYaraSubset(source: string, bytes: Uint8Array): YaraScanResult {
  const errors: string[] = [];
  const rules = parseYaraRules(source, errors).map((rule) => evaluateRule(rule, bytes));
  return { rules, errors };
}

export function parseYaraRules(source: string, errors: string[] = []): YaraRule[] {
  const rules: YaraRule[] = [];
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  const rulePattern = /\brule\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let match: RegExpExecArray | null;

  while ((match = rulePattern.exec(withoutComments))) {
    const name = match[1];
    const open = withoutComments.indexOf('{', rulePattern.lastIndex);
    if (open === -1) {
      errors.push(`Rule ${name} is missing an opening brace.`);
      continue;
    }

    const close = findMatchingBrace(withoutComments, open);
    if (close === -1) {
      errors.push(`Rule ${name} is missing a closing brace.`);
      continue;
    }

    const body = withoutComments.slice(open + 1, close);
    rules.push(parseRuleBody(name, body, errors));
    rulePattern.lastIndex = close + 1;
  }

  if (rules.length === 0 && source.trim()) {
    errors.push('No YARA rules were parsed.');
  }

  return rules;
}

function findMatchingBrace(source: string, open: number): number {
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = open; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function parseRuleBody(name: string, body: string, errors: string[]): YaraRule {
  const stringsSection = body.match(/\bstrings\s*:\s*([\s\S]*?)(?:\bcondition\s*:|$)/i)?.[1] ?? '';
  const condition = body.match(/\bcondition\s*:\s*([\s\S]*)$/i)?.[1].trim() ?? 'any of them';
  const strings: YaraStringPattern[] = [];
  const stringPattern =
    /\$([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"((?:\\.|[^"])*)"|\/((?:\\.|[^/])+)\/|\{([^}]*)\})([^\r\n]*)/g;
  let match: RegExpExecArray | null;

  while ((match = stringPattern.exec(stringsSection))) {
    const [, id, literal, regexSource, hexSource, modifiers] = match;
    const nocase = /\bnocase\b/i.test(modifiers);

    if (literal !== undefined) {
      strings.push({
        id,
        kind: 'literal',
        source: unescapeLiteral(literal),
        nocase
      });
      continue;
    }

    if (regexSource !== undefined) {
      try {
        strings.push({
          id,
          kind: 'regex',
          source: regexSource,
          nocase,
          regex: new RegExp(regexSource, `g${nocase ? 'i' : ''}`)
        });
      } catch {
        errors.push(`Rule ${name} has an invalid regex string $${id}.`);
      }
      continue;
    }

    const parsedHex = parseHexPattern(hexSource ?? '');
    if (parsedHex.length === 0) {
      errors.push(`Rule ${name} has an empty hex string $${id}.`);
    } else {
      strings.push({ id, kind: 'hex', source: hexSource ?? '', nocase, bytes: parsedHex });
    }
  }

  return { name, strings, condition };
}

function parseHexPattern(source: string): (number | null)[] {
  return source
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (/^\?\?$/.test(token)) {
        return null;
      }
      if (/^[0-9a-fA-F]{2}$/.test(token)) {
        return Number.parseInt(token, 16);
      }
      return Number.NaN;
    })
    .filter((value) => value === null || Number.isFinite(value));
}

function evaluateRule(rule: YaraRule, bytes: Uint8Array): YaraRuleMatch {
  const text = decoder.decode(bytes);
  const stringMatches = rule.strings
    .map((pattern) => matchPattern(pattern, bytes, text))
    .filter((item) => item.offsets.length > 0);
  const matched = evaluateCondition(rule.condition, rule.strings, stringMatches);

  return {
    rule: rule.name,
    matched,
    strings: stringMatches,
    condition: rule.condition
  };
}

function matchPattern(
  pattern: YaraStringPattern,
  bytes: Uint8Array,
  text: string
): YaraStringMatch {
  if (pattern.kind === 'hex' && pattern.bytes) {
    const offsets = collectPatternOffsets(bytes, pattern.bytes, 100);
    return { id: pattern.id, offsets, sample: pattern.source };
  }

  if (pattern.kind === 'regex' && pattern.regex) {
    pattern.regex.lastIndex = 0;
    const offsets = Array.from(text.matchAll(pattern.regex), (match) => match.index ?? 0).slice(
      0,
      100
    );
    return { id: pattern.id, offsets, sample: `/${pattern.source}/` };
  }

  const literalBytes = encoder.encode(pattern.source);
  const haystack = pattern.nocase ? lowerBytes(bytes) : bytes;
  const needle = pattern.nocase ? lowerBytes(literalBytes) : literalBytes;
  return {
    id: pattern.id,
    offsets: collectPatternOffsets(haystack, Array.from(needle), 100),
    sample: bytesToHex(literalBytes, 32)
  };
}

function lowerBytes(bytes: Uint8Array): Uint8Array {
  const lowered = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    const byte = bytes[index];
    lowered[index] = byte >= 0x41 && byte <= 0x5a ? byte + 0x20 : byte;
  }
  return lowered;
}

function evaluateCondition(
  condition: string,
  patterns: YaraStringPattern[],
  matches: YaraStringMatch[]
): boolean {
  const matchedIds = new Set(matches.map((item) => item.id));
  const normalized = condition.trim().toLowerCase();

  if (!normalized) {
    return matches.length > 0;
  }

  if (/\bany\s+of\s+them\b/.test(normalized)) {
    return matches.length > 0;
  }

  if (/\ball\s+of\s+them\b/.test(normalized)) {
    return patterns.length > 0 && matches.length === patterns.length;
  }

  const countMatch = normalized.match(/\b(\d+)\s+of\s+them\b/);
  if (countMatch) {
    return matches.length >= Number(countMatch[1]);
  }

  return evaluateBooleanExpression(condition, matchedIds);
}

function unescapeLiteral(value: string): string {
  return value.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16))
  );
}
