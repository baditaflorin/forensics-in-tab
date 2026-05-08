export const MiB = 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

export function toHex(value: number, width = 2): string {
  return value.toString(16).toUpperCase().padStart(width, '0');
}

export function formatOffset(offset: number): string {
  return `0x${toHex(offset, 8)}`;
}

export function readUInt16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

export function readUInt32LE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

export function bytesToHex(bytes: Uint8Array, max = bytes.length): string {
  return Array.from(bytes.slice(0, max), (byte) => toHex(byte)).join(' ');
}

export function asciiPreview(bytes: Uint8Array, max = 96): string {
  return Array.from(bytes.slice(0, max), (byte) =>
    byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'
  ).join('');
}

export function findPattern(
  bytes: Uint8Array,
  pattern: readonly (number | null)[],
  start = 0
): number {
  if (pattern.length === 0 || bytes.length < pattern.length) {
    return -1;
  }

  for (let index = Math.max(0, start); index <= bytes.length - pattern.length; index += 1) {
    let matched = true;
    for (let cursor = 0; cursor < pattern.length; cursor += 1) {
      const expected = pattern[cursor];
      if (expected !== null && bytes[index + cursor] !== expected) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return index;
    }
  }

  return -1;
}

export function collectPatternOffsets(
  bytes: Uint8Array,
  pattern: readonly (number | null)[],
  limit = 100
): number[] {
  const offsets: number[] = [];
  let cursor = 0;

  while (offsets.length < limit) {
    const found = findPattern(bytes, pattern, cursor);
    if (found === -1) {
      break;
    }
    offsets.push(found);
    cursor = found + Math.max(1, pattern.length);
  }

  return offsets;
}

export function estimateEntropy(bytes: Uint8Array): number {
  if (bytes.length === 0) {
    return 0;
  }

  const counts = new Uint32Array(256);
  for (const byte of bytes) {
    counts[byte] += 1;
  }

  let entropy = 0;
  for (const count of counts) {
    if (count === 0) {
      continue;
    }
    const probability = count / bytes.length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

export interface ExtractedString {
  value: string;
  offset: number;
  encoding: 'ascii' | 'utf16le';
}

export function extractAsciiStrings(
  bytes: Uint8Array,
  minLength = 5,
  limit = 1000
): ExtractedString[] {
  const strings: ExtractedString[] = [];
  let start = -1;
  let current = '';

  for (let index = 0; index < bytes.length; index += 1) {
    const byte = bytes[index];
    const printable = byte >= 32 && byte <= 126;

    if (printable) {
      if (start === -1) {
        start = index;
      }
      current += String.fromCharCode(byte);
      continue;
    }

    if (current.length >= minLength) {
      strings.push({ value: current, offset: start, encoding: 'ascii' });
      if (strings.length >= limit) {
        return strings;
      }
    }
    start = -1;
    current = '';
  }

  if (current.length >= minLength && strings.length < limit) {
    strings.push({ value: current, offset: start, encoding: 'ascii' });
  }

  return strings;
}

export function extractUtf16LeStrings(
  bytes: Uint8Array,
  minLength = 5,
  limit = 500
): ExtractedString[] {
  const strings: ExtractedString[] = [];
  let start = -1;
  let current = '';

  for (let index = 0; index < bytes.length - 1; index += 2) {
    const byte = bytes[index];
    const zero = bytes[index + 1];
    const printable = zero === 0 && byte >= 32 && byte <= 126;

    if (printable) {
      if (start === -1) {
        start = index;
      }
      current += String.fromCharCode(byte);
      continue;
    }

    if (current.length >= minLength) {
      strings.push({ value: current, offset: start, encoding: 'utf16le' });
      if (strings.length >= limit) {
        return strings;
      }
    }
    start = -1;
    current = '';
  }

  if (current.length >= minLength && strings.length < limit) {
    strings.push({ value: current, offset: start, encoding: 'utf16le' });
  }

  return strings;
}

export function clampSlice(bytes: Uint8Array, offset: number, length: number): Uint8Array {
  const start = Math.max(0, Math.min(bytes.length, offset));
  const end = Math.max(start, Math.min(bytes.length, start + length));
  return bytes.slice(start, end);
}
