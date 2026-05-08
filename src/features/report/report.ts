import type { DiskAnalysis } from '../disk/disk';
import type { DisasmResult } from '../disasm/disasm';
import type { EvidenceMetadata } from '../evidence/evidence';
import type { MemoryAnalysis } from '../memory/memory';
import type { YaraScanResult } from '../yara/yaraEngine';

export interface CaseReport {
  generatedAt: string;
  app: {
    name: string;
    version: string;
    commit: string;
    repository: string;
  };
  evidence?: EvidenceMetadata;
  disk?: DiskAnalysis;
  memory?: MemoryAnalysis;
  yara?: YaraScanResult;
  disassembly?: DisasmResult;
  privacy: {
    evidenceUploaded: false;
    runtimeBackend: false;
  };
}

export function buildCaseReport(input: {
  app: CaseReport['app'];
  evidence?: EvidenceMetadata;
  disk?: DiskAnalysis;
  memory?: MemoryAnalysis;
  yara?: YaraScanResult;
  disassembly?: DisasmResult;
}): CaseReport {
  return {
    generatedAt: new Date().toISOString(),
    app: input.app,
    evidence: input.evidence,
    disk: input.disk,
    memory: input.memory,
    yara: input.yara,
    disassembly: input.disassembly,
    privacy: {
      evidenceUploaded: false,
      runtimeBackend: false
    }
  };
}
