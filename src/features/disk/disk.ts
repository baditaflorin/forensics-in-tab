import {
  asciiPreview,
  bytesToHex,
  collectPatternOffsets,
  estimateEntropy,
  findPattern,
  formatOffset,
  readUInt32LE
} from '../../lib/bytes';

export interface PartitionEntry {
  index: number;
  bootable: boolean;
  type: string;
  typeHex: string;
  lbaStart: number;
  sectors: number;
  sizeBytes: number;
}

export interface RecoveredArtifact {
  id: string;
  kind: string;
  extension: string;
  offset: number;
  size: number;
  confidence: 'high' | 'medium';
  previewHex: string;
  previewAscii: string;
}

export interface DiskAnalysis {
  partitions: PartitionEntry[];
  artifacts: RecoveredArtifact[];
  signaturesScanned: number;
  entropy: number;
  warnings: string[];
}

interface FileSignature {
  kind: string;
  extension: string;
  start: number[];
  end?: number[];
  maxBytes: number;
}

const signatures: FileSignature[] = [
  {
    kind: 'Portable Executable',
    extension: 'exe',
    start: [0x4d, 0x5a],
    maxBytes: 8 * 1024 * 1024
  },
  {
    kind: 'ELF binary',
    extension: 'elf',
    start: [0x7f, 0x45, 0x4c, 0x46],
    maxBytes: 8 * 1024 * 1024
  },
  {
    kind: 'PDF document',
    extension: 'pdf',
    start: [0x25, 0x50, 0x44, 0x46],
    end: [0x25, 0x25, 0x45, 0x4f, 0x46],
    maxBytes: 32 * 1024 * 1024
  },
  {
    kind: 'PNG image',
    extension: 'png',
    start: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    end: [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82],
    maxBytes: 16 * 1024 * 1024
  },
  {
    kind: 'JPEG image',
    extension: 'jpg',
    start: [0xff, 0xd8, 0xff],
    end: [0xff, 0xd9],
    maxBytes: 16 * 1024 * 1024
  },
  {
    kind: 'ZIP archive',
    extension: 'zip',
    start: [0x50, 0x4b, 0x03, 0x04],
    end: [0x50, 0x4b, 0x05, 0x06],
    maxBytes: 64 * 1024 * 1024
  },
  {
    kind: 'SQLite database',
    extension: 'sqlite',
    start: Array.from(new TextEncoder().encode('SQLite format 3')),
    maxBytes: 64 * 1024 * 1024
  }
];

const partitionTypes: Record<number, string> = {
  0x01: 'FAT12',
  0x04: 'FAT16 <32M',
  0x05: 'Extended',
  0x06: 'FAT16',
  0x07: 'NTFS/exFAT/HPFS',
  0x0b: 'FAT32 CHS',
  0x0c: 'FAT32 LBA',
  0x0e: 'FAT16 LBA',
  0x0f: 'Extended LBA',
  0x82: 'Linux swap',
  0x83: 'Linux filesystem',
  0x8e: 'Linux LVM',
  0xa5: 'FreeBSD',
  0xaf: 'Apple HFS/HFS+',
  0xee: 'GPT protective MBR'
};

export function analyzeDiskImage(bytes: Uint8Array): DiskAnalysis {
  const warnings: string[] = [];
  const partitions = parseMbrPartitions(bytes);
  const artifacts = carveArtifacts(bytes);

  if (bytes.length < 512) {
    warnings.push('Sample is smaller than one sector; partition parsing was skipped.');
  } else if (partitions.length === 0) {
    warnings.push('No MBR partition entries were detected in the sampled bytes.');
  }

  if (artifacts.length === 0) {
    warnings.push('No known file signatures were carved from the sampled bytes.');
  }

  return {
    partitions,
    artifacts,
    signaturesScanned: signatures.length,
    entropy: estimateEntropy(bytes.slice(0, Math.min(bytes.length, 1024 * 1024))),
    warnings
  };
}

export function parseMbrPartitions(bytes: Uint8Array): PartitionEntry[] {
  if (bytes.length < 512 || bytes[510] !== 0x55 || bytes[511] !== 0xaa) {
    return [];
  }

  const partitions: PartitionEntry[] = [];
  for (let slot = 0; slot < 4; slot += 1) {
    const offset = 446 + slot * 16;
    const typeByte = bytes[offset + 4];
    const lbaStart = readUInt32LE(bytes, offset + 8);
    const sectors = readUInt32LE(bytes, offset + 12);

    if (typeByte === 0 || sectors === 0) {
      continue;
    }

    partitions.push({
      index: slot + 1,
      bootable: bytes[offset] === 0x80,
      type: partitionTypes[typeByte] ?? 'Unknown',
      typeHex: `0x${typeByte.toString(16).padStart(2, '0').toUpperCase()}`,
      lbaStart,
      sectors,
      sizeBytes: sectors * 512
    });
  }

  return partitions;
}

/**
 * Maximum start-pattern length across every signature. Used as the
 * overlap when streaming-carving large evidence so a signature that
 * straddles a window boundary still matches in the next window.
 */
const MAX_SIGNATURE_LENGTH = signatures.reduce(
  (max, sig) => Math.max(max, sig.start.length, sig.end?.length ?? 0),
  0
);

/**
 * Carve artifacts across an arbitrarily large source by walking it in
 * overlapping windows. The disk.ts cap of 64 MiB applies to the
 * synchronous `carveArtifacts` (which keeps everything in one
 * Uint8Array); when a caller has a larger source available it can ask
 * for chunked carving — e.g. via a streamed `File.slice()` reader —
 * and get artifacts pinned to absolute offsets in the original source.
 *
 * The async-iterable parameter mirrors `ReadableStreamDefaultReader`
 * shape so callers can plug in either a real `File`-backed stream or
 * a synthetic one in tests without depending on the DOM.
 */
export async function carveArtifactsStreaming(
  reader: {
    next(): Promise<{ done: boolean; value?: Uint8Array; baseOffset: number }>;
  },
  maxArtifacts = 80
): Promise<RecoveredArtifact[]> {
  const all: RecoveredArtifact[] = [];
  const seen = new Set<string>();
  // The overlap region is duplicated between adjacent windows so a
  // pattern straddling the seam still resolves. We tag each artifact
  // by absolute offset and skip duplicates from the overlap.
  for (;;) {
    const chunk = await reader.next();
    if (chunk.done || !chunk.value) break;
    const local = carveArtifacts(chunk.value, maxArtifacts);
    for (const artifact of local) {
      const absolute = artifact.offset + chunk.baseOffset;
      const key = `${artifact.extension}-${absolute}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({
        ...artifact,
        offset: absolute,
        id: `${artifact.extension}-${formatOffset(absolute)}`
      });
      if (all.length >= maxArtifacts) return all.sort((a, b) => a.offset - b.offset);
    }
  }
  return all.sort((a, b) => a.offset - b.offset);
}

/**
 * Build a chunk-reader that walks a `File` (or anything with a
 * `slice(start, end)` returning an ArrayBuffer-yielding object) in
 * overlapping windows. Used by `carveArtifactsStreaming` to scan a
 * whole disk image without materialising it all in memory.
 */
export function chunkedFileReader(
  source: { size: number; slice: (start: number, end: number) => Blob },
  options: { windowBytes?: number } = {}
): { next(): Promise<{ done: boolean; value?: Uint8Array; baseOffset: number }> } {
  const windowBytes = options.windowBytes ?? 32 * 1024 * 1024;
  const overlap = MAX_SIGNATURE_LENGTH;
  let cursor = 0;
  return {
    async next() {
      if (cursor >= source.size) {
        return { done: true, baseOffset: cursor };
      }
      const start = cursor;
      const end = Math.min(source.size, cursor + windowBytes);
      const slice = source.slice(start, end);
      const buffer = await slice.arrayBuffer();
      const value = new Uint8Array(buffer);
      // Advance by windowBytes - overlap so adjacent windows share
      // the overlap region. Never advance by less than 1 byte (would
      // happen if windowBytes were absurdly small).
      cursor += Math.max(1, windowBytes - overlap);
      return { done: false, value, baseOffset: start };
    }
  };
}

export function carveArtifacts(bytes: Uint8Array, maxArtifacts = 80): RecoveredArtifact[] {
  const artifacts: RecoveredArtifact[] = [];

  for (const signature of signatures) {
    for (const offset of collectPatternOffsets(bytes, signature.start, maxArtifacts)) {
      if (artifacts.length >= maxArtifacts) {
        return artifacts.sort((a, b) => a.offset - b.offset);
      }

      const endOffset = signature.end
        ? findPattern(bytes, signature.end, offset + signature.start.length)
        : -1;
      const size =
        endOffset >= 0
          ? endOffset + (signature.end?.length ?? 0) - offset
          : Math.min(signature.maxBytes, bytes.length - offset);
      const sample = bytes.slice(offset, Math.min(bytes.length, offset + Math.min(size, 96)));

      artifacts.push({
        id: `${signature.extension}-${formatOffset(offset)}`,
        kind: signature.kind,
        extension: signature.extension,
        offset,
        size,
        confidence: endOffset >= 0 || !signature.end ? 'high' : 'medium',
        previewHex: bytesToHex(sample),
        previewAscii: asciiPreview(sample)
      });
    }
  }

  return artifacts.sort((a, b) => a.offset - b.offset);
}
