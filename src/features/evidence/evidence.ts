import { z } from 'zod';
import { MiB } from '../../lib/bytes';

export const maxSampleBytes = 64 * MiB;

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

export interface LoadedEvidence {
  metadata: EvidenceMetadata;
  bytes: Uint8Array;
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

  return { metadata, bytes };
}

export async function hashSha256(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const buffer = copy.buffer as ArrayBuffer;
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
