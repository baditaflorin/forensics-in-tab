import {
  ArchiveRestore,
  FileJson,
  HardDrive,
  Microscope,
  Settings2,
  ShieldAlert,
  TerminalSquare
} from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForensicsSession } from './app/useForensicsSession';
import type { AppTab } from './app/session';
import { analyzeDiskImage, type DiskAnalysis } from './features/disk/disk';
import { DiskPanel } from './features/disk/DiskPanel';
import { DisasmPanel } from './features/disasm/DisasmPanel';
import { EvidenceIntake } from './features/evidence/EvidenceIntake';
import { analyzeMemory, summarizeMemory, type MemoryAnalysis } from './features/memory/memory';
import { MemoryPanel } from './features/memory/MemoryPanel';
import { ReportPanel } from './features/report/ReportPanel';
import { YaraPanel } from './features/yara/YaraPanel';
import { fetchBuildInfo } from './lib/buildInfo';
import { formatBytes } from './lib/bytes';
import { copyText } from './lib/export';
import { Header } from './ui/Header';
import { EmptyState, PanelCard } from './ui/PanelCard';
import { Tabs, type TabItem } from './ui/Tabs';

const tabs: TabItem<AppTab>[] = [
  { id: 'overview', label: 'Overview', icon: Microscope },
  { id: 'disk', label: 'Disk', icon: HardDrive },
  { id: 'memory', label: 'Memory', icon: ArchiveRestore },
  { id: 'yara', label: 'YARA', icon: ShieldAlert },
  { id: 'disasm', label: 'Disasm', icon: TerminalSquare },
  { id: 'report', label: 'Report', icon: FileJson },
  { id: 'settings', label: 'Settings', icon: Settings2 }
];

export default function App() {
  const {
    activeEvidence,
    busy,
    error,
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
    exportSessionSnapshot,
    createShareHash
  } = useForensicsSession();
  const { data: buildInfo } = useQuery({ queryKey: ['build-info'], queryFn: fetchBuildInfo });

  const activeBytes = activeEvidence?.bytes;
  const disk = useMemo<DiskAnalysis | undefined>(
    () => (activeBytes ? analyzeDiskImage(activeBytes) : undefined),
    [activeBytes]
  );
  const memory = useMemo<MemoryAnalysis | undefined>(
    () => (activeBytes ? analyzeMemory(activeBytes) : undefined),
    [activeBytes]
  );
  const yaraResult = activeEvidence ? state.yara.resultsByEvidenceId[activeEvidence.id] : undefined;
  const disasmResult = activeEvidence
    ? state.disasm.resultsByEvidenceId[activeEvidence.id]
    : undefined;

  async function handleShare() {
    const hash = createShareHash();
    const url = new URL(window.location.href);
    url.hash = hash;
    if (url.toString().length > 4000) {
      throw new Error('This session is too large for a share URL. Save a session file instead.');
    }
    await copyText(url.toString());
    setNotice('Copied a shareable URL for this session.');
  }

  return (
    <div className="min-h-screen bg-slatewash text-ink">
      <Header buildInfo={buildInfo} />
      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
        <div className="print:hidden">
          <EvidenceIntake
            evidence={state.evidence}
            activeEvidenceId={state.activeEvidenceId}
            busy={busy}
            onFiles={addFiles}
            onPaste={async (content, mode) => {
              try {
                await addPastedEvidence(content, mode);
              } catch (caught) {
                setError(
                  caught instanceof Error ? caught.message : 'Pasted evidence could not be loaded.'
                );
              }
            }}
            onImportSession={async (file) => {
              try {
                await importSessionFile(file);
              } catch (caught) {
                setError(
                  caught instanceof Error ? caught.message : 'Session could not be imported.'
                );
              }
            }}
            onSample={async () => {
              try {
                await addSampleEvidence();
              } catch (caught) {
                setError(
                  caught instanceof Error ? caught.message : 'Sample evidence could not be loaded.'
                );
              }
            }}
            onClear={clearAll}
            onSelectEvidence={selectEvidence}
            onRemoveEvidence={removeEvidence}
            onSetEvidenceKind={setEvidenceKind}
          />

          {notice ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {notice}
            </p>
          ) : null}
          {error ? <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}

          <Tabs tabs={tabs} active={state.activeTab} onChange={setActiveTab} />
        </div>

        {state.activeTab === 'overview' ? (
          <Overview
            evidenceCount={state.evidence.length}
            activeEvidence={activeEvidence}
            disk={disk}
            memory={memory}
          />
        ) : state.activeTab === 'disk' ? (
          <DiskPanel analysis={disk} />
        ) : state.activeTab === 'memory' ? (
          <MemoryPanel analysis={memory} />
        ) : state.activeTab === 'yara' ? (
          <YaraPanel
            bytes={activeBytes}
            rules={state.yara.rules}
            onRulesChange={setYaraRules}
            result={yaraResult}
            onResult={(result) => {
              if (activeEvidence) {
                setYaraResult(activeEvidence.id, result);
              }
            }}
          />
        ) : state.activeTab === 'disasm' ? (
          <DisasmPanel
            bytes={activeBytes}
            architecture={state.disasm.architecture}
            offset={state.disasm.offset}
            length={state.disasm.length}
            onSettingsChange={setDisasmSettings}
            result={disasmResult}
            onResult={(result) => {
              if (activeEvidence) {
                setDisasmResult(activeEvidence.id, result);
              }
            }}
          />
        ) : state.activeTab === 'report' ? (
          <ReportPanel
            buildInfo={buildInfo}
            evidence={activeEvidence?.metadata}
            disk={disk}
            memory={memory}
            yara={yaraResult}
            disassembly={disasmResult}
            sessionSnapshot={exportSessionSnapshot()}
            onShare={handleShare}
            onNotice={setNotice}
            onError={setError}
          />
        ) : (
          <SettingsPanel
            restoreLastCase={state.settings.restoreLastCase}
            rememberLastTab={state.settings.rememberLastTab}
            openRecommendedTab={state.settings.openRecommendedTab}
            onChange={updateSettings}
          />
        )}
      </main>
    </div>
  );
}

function Overview({
  evidenceCount,
  activeEvidence,
  disk,
  memory
}: {
  evidenceCount: number;
  activeEvidence?: {
    metadata: { size: number; sampledBytes: number; hashScope: string; name: string };
  };
  disk?: DiskAnalysis;
  memory?: MemoryAnalysis;
}) {
  if (!activeEvidence) {
    return (
      <EmptyState label="Load evidence to start a case. The browser keeps processing local and static by design." />
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-4">
      <Metric label="Case Queue" value={String(evidenceCount)} />
      <Metric label="Active Evidence" value={formatBytes(activeEvidence.metadata.size)} />
      <Metric label="Sampled Bytes" value={formatBytes(activeEvidence.metadata.sampledBytes)} />
      <Metric label="Memory" value={memory ? summarizeMemory(memory) : 'No sample'} wide />

      <PanelCard title="Case Summary" description={activeEvidence.metadata.name}>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Recovered artifacts</dt>
            <dd className="font-semibold">{disk?.artifacts.length ?? 0}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Partitions</dt>
            <dd className="font-semibold">{disk?.partitions.length ?? 0}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Hash scope</dt>
            <dd className="font-semibold">{activeEvidence.metadata.hashScope}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Privacy boundary</dt>
            <dd className="font-semibold">Static Pages, no runtime upload</dd>
          </div>
        </dl>
      </PanelCard>
    </section>
  );
}

function SettingsPanel({
  restoreLastCase,
  rememberLastTab,
  openRecommendedTab,
  onChange
}: {
  restoreLastCase: boolean;
  rememberLastTab: boolean;
  openRecommendedTab: boolean;
  onChange: (settings: {
    restoreLastCase?: boolean;
    rememberLastTab?: boolean;
    openRecommendedTab?: boolean;
  }) => void;
}) {
  return (
    <PanelCard
      title="Settings"
      description="Every setting here has a real effect on how the app restores and routes your local work."
    >
      <div className="grid gap-4">
        <SettingRow
          title="Restore last case on reopen"
          description="Save the current local case in this browser and reopen it after a refresh."
          checked={restoreLastCase}
          onChange={(checked) => onChange({ restoreLastCase: checked })}
        />
        <SettingRow
          title="Remember last active tab"
          description="Reopen on the panel you were using last, instead of always landing on Overview."
          checked={rememberLastTab}
          onChange={(checked) => onChange({ rememberLastTab: checked })}
        />
        <SettingRow
          title="Open the recommended tab after intake"
          description="Jump to Disk or Memory automatically when the detected evidence kind is obvious."
          checked={openRecommendedTab}
          onChange={(checked) => onChange({ openRecommendedTab: checked })}
        />
      </div>
    </PanelCard>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <input
        checked={checked}
        className="mt-1 h-5 w-5 rounded border-slate-300"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-lg bg-white p-5 shadow-panel ${wide ? 'lg:col-span-1' : ''}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
    </div>
  );
}
