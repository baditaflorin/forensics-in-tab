import {
  ExtractedString,
  collectPatternOffsets,
  estimateEntropy,
  extractAsciiStrings,
  extractUtf16LeStrings,
  formatOffset,
  readUInt32LE
} from '../../lib/bytes';

export interface IocFinding {
  type: 'url' | 'ip' | 'email' | 'path' | 'registry' | 'api';
  value: string;
  offset: number;
}

export interface PeFinding {
  offset: number;
  hasPeHeader: boolean;
  peHeaderOffset?: number;
}

export interface EntropyWindow {
  offset: number;
  entropy: number;
}

export interface MemoryAnalysis {
  strings: ExtractedString[];
  iocs: IocFinding[];
  peFindings: PeFinding[];
  processHints: string[];
  entropyHotspots: EntropyWindow[];
  warnings: string[];
}

const suspiciousApis = [
  'VirtualAlloc',
  'WriteProcessMemory',
  'CreateRemoteThread',
  'LoadLibraryA',
  'LoadLibraryW',
  'WinExec',
  'InternetOpen',
  'InternetConnect',
  'URLDownloadToFile',
  'CryptDecrypt',
  'IsDebuggerPresent'
];

export function analyzeMemory(bytes: Uint8Array): MemoryAnalysis {
  const strings = [
    ...extractAsciiStrings(bytes, 5, 700),
    ...extractUtf16LeStrings(bytes, 5, 300)
  ].sort((a, b) => a.offset - b.offset);

  const iocs = extractIocs(strings);
  const peFindings = locatePeHeaders(bytes);
  const processHints = Array.from(
    new Set(
      strings
        .map((item) => item.value.match(/[A-Za-z0-9_.-]{2,64}\.(?:exe|dll|sys)/i)?.[0])
        .filter((value): value is string => Boolean(value))
    )
  ).slice(0, 40);
  const entropyHotspots = calculateEntropyHotspots(bytes);
  const warnings: string[] = [];

  if (strings.length === 0) {
    warnings.push('No printable strings were found in the sampled memory.');
  }

  return { strings, iocs, peFindings, processHints, entropyHotspots, warnings };
}

function extractIocs(strings: ExtractedString[]): IocFinding[] {
  const findings: IocFinding[] = [];
  const patterns: Array<[IocFinding['type'], RegExp]> = [
    ['url', /\bhttps?:\/\/[^\s"'<>]{4,}/gi],
    ['ip', /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g],
    ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
    ['path', /[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/g],
    ['registry', /HKEY_(?:LOCAL_MACHINE|CURRENT_USER|CLASSES_ROOT|USERS)\\[^\s"'<>]+/gi]
  ];

  for (const item of strings) {
    for (const [type, pattern] of patterns) {
      pattern.lastIndex = 0;
      for (const match of item.value.matchAll(pattern)) {
        findings.push({
          type,
          value: match[0],
          offset: item.offset + (match.index ?? 0)
        });
      }
    }

    for (const api of suspiciousApis) {
      const index = item.value.toLowerCase().indexOf(api.toLowerCase());
      if (index >= 0) {
        findings.push({ type: 'api', value: api, offset: item.offset + index });
      }
    }
  }

  const unique = new Map<string, IocFinding>();
  for (const finding of findings) {
    unique.set(`${finding.type}:${finding.value}:${finding.offset}`, finding);
  }

  return Array.from(unique.values()).slice(0, 120);
}

function locatePeHeaders(bytes: Uint8Array): PeFinding[] {
  return collectPatternOffsets(bytes, [0x4d, 0x5a], 80).map((offset) => {
    if (offset + 0x40 >= bytes.length) {
      return { offset, hasPeHeader: false };
    }
    const peHeaderOffset = readUInt32LE(bytes, offset + 0x3c);
    const absolute = offset + peHeaderOffset;
    const hasPeHeader =
      absolute + 4 <= bytes.length &&
      bytes[absolute] === 0x50 &&
      bytes[absolute + 1] === 0x45 &&
      bytes[absolute + 2] === 0 &&
      bytes[absolute + 3] === 0;

    return { offset, hasPeHeader, peHeaderOffset: hasPeHeader ? absolute : undefined };
  });
}

function calculateEntropyHotspots(bytes: Uint8Array): EntropyWindow[] {
  const windowSize = 4096;
  if (bytes.length < windowSize) {
    return [{ offset: 0, entropy: estimateEntropy(bytes) }];
  }

  const windows: EntropyWindow[] = [];
  for (let offset = 0; offset < bytes.length; offset += windowSize) {
    const window = bytes.slice(offset, Math.min(bytes.length, offset + windowSize));
    windows.push({ offset, entropy: estimateEntropy(window) });
  }

  return windows.sort((a, b) => b.entropy - a.entropy).slice(0, 8);
}

export function summarizeMemory(analysis: MemoryAnalysis): string {
  const highEntropy = analysis.entropyHotspots.filter((item) => item.entropy >= 7.2).length;
  return `${analysis.strings.length} strings, ${analysis.iocs.length} IOCs, ${analysis.peFindings.length} MZ offsets, ${highEntropy} high-entropy windows`;
}

export function formatPeFinding(finding: PeFinding): string {
  return finding.hasPeHeader && finding.peHeaderOffset !== undefined
    ? `${formatOffset(finding.offset)} -> PE at ${formatOffset(finding.peHeaderOffset)}`
    : `${formatOffset(finding.offset)} -> MZ only`;
}
