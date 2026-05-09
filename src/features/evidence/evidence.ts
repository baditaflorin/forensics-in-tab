import { z } from 'zod';
import { MiB } from '../../lib/bytes';

export const maxSampleBytes = 64 * MiB;
export const evidenceKindSchema = z.enum([
  'disk-image',
  'memory-dump',
  'binary-sample',
  'text-buffer'
]);

export const evidenceMetadataSchema = z.object({
  name: z.string(),
  size: z.number().nonnegative(),
  type: z.string(),
  lastModified: z.number(),
  sampledBytes: z.number().nonnegative(),
  sha256: z.string(),
  hashScope: z.enum(['full-file', 'first-64-mib'])
});

export type EvidenceMetadata = z.infer<typeof evidenceMetadataSchema>;
export type EvidenceKind = z.infer<typeof evidenceKindSchema>;

export interface LoadedEvidence {
  metadata: EvidenceMetadata;
  bytes: Uint8Array;
  detectedKind: EvidenceKind;
}

export async function loadEvidenceFile(file: File): Promise<LoadedEvidence> {
  const sampledBytes = Math.min(file.size, maxSampleBytes);
  const bytes = new Uint8Array(await file.slice(0, sampledBytes).arrayBuffer());
  const sha256 = await hashSha256(bytes);

  const metadata = evidenceMetadataSchema.parse({
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified,
    sampledBytes,
    sha256,
    hashScope: sampledBytes === file.size ? 'full-file' : 'first-64-mib'
  });

  return {
    metadata,
    bytes,
    detectedKind: detectEvidenceKind({
      name: file.name,
      type: metadata.type,
      bytes
    })
  };
}

export async function loadEvidenceBytes(args: {
  bytes: Uint8Array;
  name: string;
  type?: string;
  lastModified?: number;
}): Promise<LoadedEvidence> {
  const sampledBytes = Math.min(args.bytes.length, maxSampleBytes);
  const bytes = args.bytes.slice(0, sampledBytes);
  const sha256 = await hashSha256(bytes);
  const metadata = evidenceMetadataSchema.parse({
    name: args.name,
    size: args.bytes.length,
    type: args.type || 'application/octet-stream',
    lastModified: args.lastModified ?? Date.now(),
    sampledBytes,
    sha256,
    hashScope: sampledBytes === args.bytes.length ? 'full-file' : 'first-64-mib'
  });

  return {
    metadata,
    bytes,
    detectedKind: detectEvidenceKind({
      name: args.name,
      type: metadata.type,
      bytes
    })
  };
}

export async function hashSha256(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest('SHA-256', copy);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function detectEvidenceKind(args: {
  name: string;
  type?: string;
  bytes: Uint8Array;
}): EvidenceKind {
  const name = args.name.toLowerCase();
  const type = (args.type ?? '').toLowerCase();
  const bytes = args.bytes;

  if (
    name.endsWith('.img') ||
    name.endsWith('.dd') ||
    name.endsWith('.raw') ||
    name.endsWith('.iso') ||
    (bytes.length > 512 && bytes[510] === 0x55 && bytes[511] === 0xaa)
  ) {
    return 'disk-image';
  }

  if (
    name.endsWith('.dmp') ||
    name.endsWith('.mem') ||
    name.endsWith('.vmem') ||
    type.includes('memory')
  ) {
    return 'memory-dump';
  }

  if (name.endsWith('.txt') || type.startsWith('text/')) {
    return 'text-buffer';
  }

  return 'binary-sample';
}

export function parsePastedEvidence(
  content: string,
  mode: 'auto' | 'text' | 'hex' | 'base64'
): Uint8Array {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error('Paste content is empty.');
  }

  if (mode === 'text') {
    return new TextEncoder().encode(content);
  }

  if (mode === 'hex' || (mode === 'auto' && looksLikeHex(trimmed))) {
    const normalized = trimmed.replace(/0x/gi, '').replace(/[^a-fA-F0-9]/g, '');
    if (normalized.length === 0 || normalized.length % 2 !== 0) {
      throw new Error('Hex input must contain an even number of hex characters.');
    }

    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < normalized.length; index += 2) {
      bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
    }
    return bytes;
  }

  if (mode === 'base64' || (mode === 'auto' && looksLikeBase64(trimmed))) {
    try {
      const binary = atob(trimmed);
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    } catch {
      throw new Error('Base64 input could not be decoded.');
    }
  }

  return new TextEncoder().encode(content);
}

function looksLikeHex(value: string): boolean {
  const normalized = value.replace(/0x/gi, '').replace(/[\s,]/g, '');
  return normalized.length >= 8 && /^[a-fA-F0-9]+$/.test(normalized);
}

function looksLikeBase64(value: string): boolean {
  return value.length >= 12 && /^[A-Za-z0-9+/=\s]+$/.test(value) && value.includes('=');
}
