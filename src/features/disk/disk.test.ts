import { describe, expect, it } from 'vitest';
import {
  analyzeDiskImage,
  carveArtifactsStreaming,
  chunkedFileReader,
  parseMbrPartitions
} from './disk';

describe('disk analysis', () => {
  it('parses MBR partition entries', () => {
    const bytes = new Uint8Array(512);
    bytes[510] = 0x55;
    bytes[511] = 0xaa;
    bytes[446] = 0x80;
    bytes[450] = 0x83;
    bytes[454] = 0x20;
    bytes[458] = 0x10;

    const partitions = parseMbrPartitions(bytes);

    expect(partitions).toHaveLength(1);
    expect(partitions[0]).toMatchObject({
      bootable: true,
      type: 'Linux filesystem',
      lbaStart: 32,
      sectors: 16
    });
  });

  it('carves files by known signatures', () => {
    const pdf = new TextEncoder().encode('%PDF-1.7 body %%EOF');
    const bytes = new Uint8Array(1024);
    bytes.set(pdf, 128);

    const analysis = analyzeDiskImage(bytes);

    expect(analysis.artifacts.some((artifact) => artifact.kind === 'PDF document')).toBe(true);
  });
});

describe('carveArtifactsStreaming', () => {
  /**
   * Build a synthetic file-like source whose `slice` returns Blob-like
   * objects. We deliberately avoid using a real File so the test works
   * in Node + vitest without DOM.
   */
  function fakeFile(bytes: Uint8Array): { size: number; slice: (s: number, e: number) => Blob } {
    return {
      size: bytes.length,
      slice(start, end) {
        const part = bytes.slice(start, end);
        return {
          arrayBuffer: () =>
            Promise.resolve(part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength))
        } as unknown as Blob;
      }
    };
  }

  it('finds a signature past the synchronous 64 MiB cap via windowed scanning', async () => {
    // Build a 96-byte source with two PDF signatures, one in each
    // 48-byte half. We use small windowBytes so both halves get
    // scanned even though a single Uint8Array.slice in the caller
    // would only see the first chunk.
    const pdf = new TextEncoder().encode('%PDF');
    const bytes = new Uint8Array(96);
    bytes.set(pdf, 4); // first signature in window 1
    bytes.set(pdf, 60); // second signature in window 2 (past the windowBytes=48 cut)

    const reader = chunkedFileReader(fakeFile(bytes), { windowBytes: 48 });
    const artifacts = await carveArtifactsStreaming(reader);
    const pdfArtifacts = artifacts.filter((a) => a.extension === 'pdf');
    expect(pdfArtifacts).toHaveLength(2);
    // Offsets are pinned to the *absolute* position in the source,
    // not the position inside whatever window the carver saw them in.
    expect(pdfArtifacts.map((a) => a.offset).sort((x, y) => x - y)).toEqual([4, 60]);
  });

  it('deduplicates artifacts that fall inside the overlap region between windows', async () => {
    const pdf = new TextEncoder().encode('%PDF');
    const bytes = new Uint8Array(128);
    // Place a single signature in the overlap zone (windowBytes - overlap
    // < offset < windowBytes). With windowBytes=64 and an 8-byte overlap
    // the seam sits at 56–64; one PDF at offset 58 lands in both
    // windows and should only be reported once.
    bytes.set(pdf, 58);

    const reader = chunkedFileReader(fakeFile(bytes), { windowBytes: 64 });
    const artifacts = await carveArtifactsStreaming(reader);
    const pdfArtifacts = artifacts.filter((a) => a.extension === 'pdf');
    expect(pdfArtifacts).toHaveLength(1);
    expect(pdfArtifacts[0]?.offset).toBe(58);
  });

  it('returns an empty list cleanly for a source with no matches', async () => {
    const bytes = new Uint8Array(1024);
    const reader = chunkedFileReader(fakeFile(bytes), { windowBytes: 256 });
    const artifacts = await carveArtifactsStreaming(reader);
    expect(artifacts).toEqual([]);
  });
});
