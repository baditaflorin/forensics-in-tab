import { describe, expect, it } from 'vitest';
import { defaultSessionState, deserializeSession, serializeSession } from './session';

describe('session serialization', () => {
  it('round-trips evidence bytes and active state', () => {
    const state = {
      ...defaultSessionState,
      activeTab: 'report' as const,
      activeEvidenceId: 'e1',
      evidence: [
        {
          id: 'e1',
          metadata: {
            name: 'sample.bin',
            size: 4,
            type: 'application/octet-stream',
            lastModified: 1,
            sampledBytes: 4,
            sha256: '00'.repeat(32),
            hashScope: 'full-file' as const
          },
          bytes: Uint8Array.from([1, 2, 3, 4]),
          source: 'sample' as const,
          detectedKind: 'binary-sample' as const,
          selectedKind: 'binary-sample' as const
        }
      ],
      yara: {
        rules: defaultSessionState.yara.rules,
        resultsByEvidenceId: {}
      }
    };

    const restored = deserializeSession(serializeSession(state));

    expect(restored.activeTab).toBe('report');
    expect(restored.activeEvidenceId).toBe('e1');
    expect(Array.from(restored.evidence[0].bytes)).toEqual([1, 2, 3, 4]);
    expect(restored.evidence[0].metadata.name).toBe('sample.bin');
  });
});
