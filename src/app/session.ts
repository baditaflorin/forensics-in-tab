import { z } from 'zod';
import { disasmResultSchema, type DisasmArchitecture } from '../features/disasm/disasm';
import {
  evidenceMetadataSchema,
  evidenceKindSchema,
  type EvidenceKind
} from '../features/evidence/evidence';
import { yaraScanResultSchema } from '../features/yara/yaraEngine';

export const tabSchema = z.enum([
  'overview',
  'disk',
  'memory',
  'yara',
  'disasm',
  'report',
  'settings'
]);

export type AppTab = z.infer<typeof tabSchema>;

export const appSettingsSchema = z.object({
  restoreLastCase: z.boolean(),
  rememberLastTab: z.boolean(),
  openRecommendedTab: z.boolean()
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const persistedEvidenceSchema = z.object({
  id: z.string(),
  metadata: evidenceMetadataSchema,
  bytesBase64: z.string(),
  source: z.enum(['file', 'paste', 'sample', 'import']),
  detectedKind: evidenceKindSchema,
  selectedKind: evidenceKindSchema,
  notes: z.string().optional()
});

export type PersistedEvidence = z.infer<typeof persistedEvidenceSchema>;

export const yaraStateSchema = z.object({
  rules: z.string(),
  resultsByEvidenceId: z.record(z.string(), yaraScanResultSchema)
});

export const disasmStateSchema = z.object({
  architecture: z.enum(['x86-16', 'x86-32', 'x86-64', 'arm64']),
  offset: z.number().int().nonnegative(),
  length: z.number().int().positive().max(4096),
  resultsByEvidenceId: z.record(z.string(), disasmResultSchema)
});

export const persistedSessionV2Schema = z.object({
  version: z.literal(2),
  activeTab: tabSchema,
  activeEvidenceId: z.string().nullable(),
  settings: appSettingsSchema,
  evidence: z.array(persistedEvidenceSchema),
  yara: yaraStateSchema,
  disasm: disasmStateSchema
});

export type PersistedSession = z.infer<typeof persistedSessionV2Schema>;

export interface EvidenceEntry {
  id: string;
  metadata: PersistedEvidence['metadata'];
  bytes: Uint8Array;
  source: PersistedEvidence['source'];
  detectedKind: EvidenceKind;
  selectedKind: EvidenceKind;
  notes?: string;
}

export interface SessionState {
  activeTab: AppTab;
  activeEvidenceId: string | null;
  settings: AppSettings;
  evidence: EvidenceEntry[];
  yara: z.infer<typeof yaraStateSchema>;
  disasm: {
    architecture: DisasmArchitecture;
    offset: number;
    length: number;
    resultsByEvidenceId: Record<string, z.infer<typeof disasmResultSchema>>;
  };
}

export const defaultSettings: AppSettings = {
  restoreLastCase: true,
  rememberLastTab: true,
  openRecommendedTab: true
};

export const defaultSessionState: SessionState = {
  activeTab: 'overview',
  activeEvidenceId: null,
  settings: defaultSettings,
  evidence: [],
  yara: {
    rules: `rule Suspicious_Triage {
  strings:
    $mz = { 4D 5A }
    $http = "http://" nocase
    $cmd = "cmd.exe" nocase
  condition:
    any of them
}`,
    resultsByEvidenceId: {}
  },
  disasm: {
    architecture: 'x86-64',
    offset: 0,
    length: 192,
    resultsByEvidenceId: {}
  }
};

export function encodeBytesBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const slice = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...slice);
  }

  return btoa(binary);
}

export function decodeBytesBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function serializeSession(state: SessionState): PersistedSession {
  return persistedSessionV2Schema.parse({
    version: 2,
    activeTab: state.activeTab,
    activeEvidenceId: state.activeEvidenceId,
    settings: state.settings,
    evidence: state.evidence.map((entry) => ({
      id: entry.id,
      metadata: entry.metadata,
      bytesBase64: encodeBytesBase64(entry.bytes),
      source: entry.source,
      detectedKind: entry.detectedKind,
      selectedKind: entry.selectedKind,
      notes: entry.notes
    })),
    yara: state.yara,
    disasm: state.disasm
  });
}

export function deserializeSession(payload: unknown): SessionState {
  const parsed = migrateSession(payload);

  return {
    activeTab: parsed.activeTab,
    activeEvidenceId: parsed.activeEvidenceId,
    settings: parsed.settings,
    evidence: parsed.evidence.map((entry) => ({
      id: entry.id,
      metadata: entry.metadata,
      bytes: decodeBytesBase64(entry.bytesBase64),
      source: entry.source,
      detectedKind: entry.detectedKind,
      selectedKind: entry.selectedKind,
      notes: entry.notes
    })),
    yara: parsed.yara,
    disasm: parsed.disasm
  };
}

export function migrateSession(payload: unknown): PersistedSession {
  return persistedSessionV2Schema.parse(payload);
}

export function recommendedTabForKind(kind: EvidenceKind): AppTab {
  switch (kind) {
    case 'disk-image':
      return 'disk';
    case 'memory-dump':
      return 'memory';
    case 'binary-sample':
    case 'text-buffer':
      return 'overview';
    default:
      return 'overview';
  }
}
