import { useEffect, useMemo, useState } from 'react';
import {
  clearSessionSnapshot,
  loadLastTab,
  loadSessionSnapshot,
  loadSettings,
  saveLastTab,
  saveSessionSnapshot,
  saveSettings
} from './persistence';
import { clearSessionShareHash, createSessionShareHash, parseSessionShareHash } from './share';
import {
  defaultSessionState,
  deserializeSession,
  recommendedTabForKind,
  serializeSession,
  tabSchema,
  type AppSettings,
  type AppTab,
  type EvidenceEntry,
  type SessionState
} from './session';
import {
  loadEvidenceBytes,
  loadEvidenceFile,
  type EvidenceKind
} from '../features/evidence/evidence';

function createEvidenceId(): string {
  return `evidence-${crypto.randomUUID()}`;
}

export function useForensicsSession() {
  const [state, setState] = useState<SessionState>(() => ({
    ...defaultSessionState,
    settings: loadSettings(),
    activeTab: readInitialTab()
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [hydrated, setHydrated] = useState(false);

  const activeEvidence = useMemo(
    () => state.evidence.find((entry) => entry.id === state.activeEvidenceId),
    [state.activeEvidenceId, state.evidence]
  );

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const shared = parseSessionShareHash(window.location.hash);
        if (shared) {
          if (!cancelled) {
            setState(shared);
            setNotice('Loaded a shared session from the URL.');
          }
          return;
        }

        if (!state.settings.restoreLastCase) {
          return;
        }

        const raw = await loadSessionSnapshot();
        if (!raw || cancelled) {
          return;
        }

        const restored = deserializeSession(JSON.parse(raw));
        setState(restored);
        setNotice('Restored the last saved case from this browser.');
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : 'Saved session could not be restored.'
          );
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    }

    void restore();

    return () => {
      cancelled = true;
    };
  }, [state.settings.restoreLastCase]);

  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    if (state.settings.rememberLastTab) {
      saveLastTab(state.activeTab);
    }
  }, [state.activeTab, state.settings.rememberLastTab]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!state.settings.restoreLastCase) {
      void clearSessionSnapshot();
      return;
    }

    void saveSessionSnapshot(state).catch((caught) => {
      setError(caught instanceof Error ? caught.message : 'Session autosave failed.');
    });
  }, [hydrated, state]);

  function setActiveTab(tab: AppTab) {
    setState((current) => ({ ...current, activeTab: tab }));
  }

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) {
      return;
    }

    setBusy(true);
    setError(undefined);
    setNotice(undefined);

    const loadedEntries: EvidenceEntry[] = [];
    const failures: string[] = [];

    for (const file of list) {
      try {
        const loaded = await loadEvidenceFile(file);
        loadedEntries.push({
          id: createEvidenceId(),
          metadata: loaded.metadata,
          bytes: loaded.bytes,
          source: 'file',
          detectedKind: loaded.detectedKind,
          selectedKind: loaded.detectedKind
        });
      } catch (caught) {
        failures.push(
          `${file.name}: ${caught instanceof Error ? caught.message : 'evidence could not be loaded'}`
        );
      }
    }

    if (loadedEntries.length > 0) {
      setState((current) => {
        const evidence = [...loadedEntries, ...current.evidence];
        const activeEvidenceId = loadedEntries[0]?.id ?? current.activeEvidenceId;
        return {
          ...current,
          evidence,
          activeEvidenceId,
          activeTab: current.settings.openRecommendedTab
            ? recommendedTabForKind(loadedEntries[0]?.selectedKind ?? 'binary-sample')
            : current.activeTab
        };
      });
      setNotice(
        loadedEntries.length === 1
          ? `Loaded ${loadedEntries[0].metadata.name}.`
          : `Loaded ${loadedEntries.length} evidence items.`
      );
    }

    if (failures.length > 0) {
      setError(failures.join(' '));
    }

    setBusy(false);
  }

  async function addPastedEvidence(content: string, mode: 'auto' | 'text' | 'hex' | 'base64') {
    const { parsePastedEvidence } = await import('../features/evidence/evidence');
    const bytes = parsePastedEvidence(content, mode);
    const loaded = await loadEvidenceBytes({
      bytes,
      name: `pasted-${mode}-${new Date().toISOString().slice(0, 19)}.bin`,
      type: mode === 'text' ? 'text/plain' : 'application/octet-stream'
    });
    const entry: EvidenceEntry = {
      id: createEvidenceId(),
      metadata: loaded.metadata,
      bytes: loaded.bytes,
      source: 'paste',
      detectedKind: loaded.detectedKind,
      selectedKind: loaded.detectedKind
    };

    setState((current) => ({
      ...current,
      evidence: [entry, ...current.evidence],
      activeEvidenceId: entry.id,
      activeTab: current.settings.openRecommendedTab
        ? recommendedTabForKind(entry.selectedKind)
        : current.activeTab
    }));
    setNotice(`Loaded pasted content as ${entry.metadata.name}.`);
  }

  async function addSampleEvidence() {
    const sampleText = [
      'MZ',
      'cmd.exe',
      'http://example.test',
      'VirtualAlloc',
      '\u0000\u0000',
      '\u0055\u0048\u0089\u00e5\u0090\u00c3'
    ].join(' ');
    const bytes = new TextEncoder().encode(sampleText);
    const loaded = await loadEvidenceBytes({
      bytes,
      name: 'sample-memory.bin',
      type: 'application/octet-stream'
    });
    const entry: EvidenceEntry = {
      id: createEvidenceId(),
      metadata: loaded.metadata,
      bytes: loaded.bytes,
      source: 'sample',
      detectedKind: 'memory-dump',
      selectedKind: 'memory-dump'
    };

    setState((current) => ({
      ...current,
      evidence: [entry, ...current.evidence],
      activeEvidenceId: entry.id,
      activeTab: current.settings.openRecommendedTab ? 'memory' : current.activeTab
    }));
    setNotice('Loaded the built-in sample evidence.');
  }

  function removeEvidence(id: string) {
    setState((current) => {
      const evidence = current.evidence.filter((entry) => entry.id !== id);
      const activeEvidenceId =
        current.activeEvidenceId === id ? (evidence[0]?.id ?? null) : current.activeEvidenceId;
      const nextYara = { ...current.yara.resultsByEvidenceId };
      const nextDisasm = { ...current.disasm.resultsByEvidenceId };
      delete nextYara[id];
      delete nextDisasm[id];
      return {
        ...current,
        evidence,
        activeEvidenceId,
        yara: { ...current.yara, resultsByEvidenceId: nextYara },
        disasm: { ...current.disasm, resultsByEvidenceId: nextDisasm }
      };
    });
  }

  function clearAll() {
    setState((current) => ({
      ...defaultSessionState,
      settings: current.settings,
      activeTab: current.settings.rememberLastTab ? current.activeTab : 'overview'
    }));
    clearSessionShareHash();
    void clearSessionSnapshot();
    setNotice('Started a fresh case.');
  }

  function selectEvidence(id: string) {
    setState((current) => ({ ...current, activeEvidenceId: id }));
  }

  function setEvidenceKind(id: string, kind: EvidenceKind) {
    setState((current) => ({
      ...current,
      evidence: current.evidence.map((entry) =>
        entry.id === id ? { ...entry, selectedKind: kind } : entry
      )
    }));
  }

  function updateSettings(next: Partial<AppSettings>) {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, ...next }
    }));
  }

  function setYaraRules(rules: string) {
    setState((current) => ({
      ...current,
      yara: { ...current.yara, rules }
    }));
  }

  function setYaraResult(
    evidenceId: string,
    result: SessionState['yara']['resultsByEvidenceId'][string]
  ) {
    setState((current) => ({
      ...current,
      yara: {
        ...current.yara,
        resultsByEvidenceId: { ...current.yara.resultsByEvidenceId, [evidenceId]: result }
      }
    }));
  }

  function setDisasmSettings(settings: Partial<SessionState['disasm']>) {
    setState((current) => ({
      ...current,
      disasm: { ...current.disasm, ...settings }
    }));
  }

  function setDisasmResult(
    evidenceId: string,
    result: SessionState['disasm']['resultsByEvidenceId'][string]
  ) {
    setState((current) => ({
      ...current,
      disasm: {
        ...current.disasm,
        resultsByEvidenceId: { ...current.disasm.resultsByEvidenceId, [evidenceId]: result }
      }
    }));
  }

  async function importSessionFile(file: File) {
    const raw = await file.text();
    const nextState = deserializeSession(JSON.parse(raw));
    setState(nextState);
    setNotice(`Imported session from ${file.name}.`);
  }

  function importSharedHash(hash: string) {
    const nextState = parseSessionShareHash(hash);
    if (!nextState) {
      throw new Error('Shared session hash is invalid.');
    }
    setState(nextState);
    setNotice('Loaded the shared session.');
  }

  function exportSessionSnapshot() {
    return serializeSession(state);
  }

  function createShareHash() {
    return createSessionShareHash(state);
  }

  return {
    activeEvidence,
    busy,
    error,
    hydrated,
    notice,
    state,
    setActiveTab,
    setError,
    setNotice,
    addFiles,
    addPastedEvidence,
    addSampleEvidence,
    removeEvidence,
    clearAll,
    selectEvidence,
    setEvidenceKind,
    updateSettings,
    setYaraRules,
    setYaraResult,
    setDisasmSettings,
    setDisasmResult,
    importSessionFile,
    importSharedHash,
    exportSessionSnapshot,
    createShareHash
  };
}

function readInitialTab(): AppTab {
  const saved = loadLastTab();
  const parsed = tabSchema.safeParse(saved);
  return parsed.success ? parsed.data : defaultSessionState.activeTab;
}
