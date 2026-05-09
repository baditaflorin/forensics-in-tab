import { Download, Play, TerminalSquare } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { downloadCsvFile } from '../../lib/export';
import { EmptyState, PanelCard } from '../../ui/PanelCard';
import type { DisasmArchitecture, DisasmResult } from './disasm';
import { disassemble } from './disasm';

interface DisasmPanelProps {
  bytes?: Uint8Array;
  architecture: DisasmArchitecture;
  offset: number;
  length: number;
  onSettingsChange: (settings: {
    architecture?: DisasmArchitecture;
    offset?: number;
    length?: number;
  }) => void;
  result?: DisasmResult;
  onResult: (result: DisasmResult) => void;
}

const architectureSchema = z.enum(['x86-16', 'x86-32', 'x86-64', 'arm64']);

export function DisasmPanel({
  bytes,
  architecture,
  offset,
  length,
  onSettingsChange,
  result,
  onResult
}: DisasmPanelProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!bytes) {
    return <EmptyState label="Load evidence to disassemble bytes." />;
  }

  async function run() {
    const sourceBytes = bytes;
    if (!sourceBytes) {
      return;
    }
    setError(undefined);
    if (!Number.isFinite(offset) || offset < 0) {
      setError('Offset must be a non-negative number.');
      return;
    }
    if (!Number.isFinite(length) || length < 1) {
      setError('Bytes must be a positive number.');
      return;
    }

    setBusy(true);
    try {
      onResult(
        await disassemble(sourceBytes, {
          architecture,
          offset,
          length,
          address: offset
        })
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[22rem_1fr]">
      <PanelCard
        title="Disassembly"
        icon={<TerminalSquare className="text-evidence" aria-hidden="true" />}
      >
        <label className="mt-4 block text-sm font-medium">
          Architecture
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={architecture}
            onChange={(event) => {
              const parsed = architectureSchema.safeParse(event.target.value);
              if (parsed.success) {
                onSettingsChange({ architecture: parsed.data });
              }
            }}
          >
            <option value="x86-64">x86-64</option>
            <option value="x86-32">x86-32</option>
            <option value="x86-16">x86-16</option>
            <option value="arm64">ARM64</option>
          </select>
        </label>
        <label className="mt-3 block text-sm font-medium">
          Offset
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            min="0"
            inputMode="numeric"
            value={String(offset)}
            onChange={(event) => onSettingsChange({ offset: Number(event.target.value) })}
          />
        </label>
        <label className="mt-3 block text-sm font-medium">
          Bytes
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            min="1"
            inputMode="numeric"
            value={String(length)}
            onChange={(event) => onSettingsChange({ length: Number(event.target.value) })}
          />
        </label>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        ) : null}
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={busy}
          type="button"
          onClick={run}
        >
          <Play aria-hidden="true" size={17} />
          {busy ? 'Running...' : 'Disassemble'}
        </button>
      </PanelCard>

      <PanelCard
        title="Instructions"
        actions={
          <>
            {result ? (
              <span className="rounded bg-slatewash px-3 py-2 text-xs font-semibold">
                {result.engine}
              </span>
            ) : null}
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={!result}
              type="button"
              onClick={() =>
                result
                  ? downloadCsvFile('forensics-in-tab-disassembly.csv', [
                      ['address', 'bytes', 'mnemonic', 'operands'],
                      ...result.instructions.map((instruction) => [
                        instruction.address,
                        instruction.bytes,
                        instruction.mnemonic,
                        instruction.operands
                      ])
                    ])
                  : undefined
              }
            >
              <Download aria-hidden="true" size={16} />
              Export CSV
            </button>
          </>
        }
      >
        {result?.warning ? <p className="mt-3 text-sm text-amber-700">{result.warning}</p> : null}
        <div className="mt-4 max-h-[480px] overflow-auto">
          <table className="w-full text-left font-mono text-xs">
            <tbody>
              {result?.instructions.map((instruction) => (
                <tr
                  key={`${instruction.address}-${instruction.bytes}`}
                  className="border-t border-slate-200"
                >
                  <td className="py-2 pr-4 text-slate-500">{instruction.address}</td>
                  <td className="pr-4 text-slate-500">{instruction.bytes}</td>
                  <td className="pr-3 font-semibold">{instruction.mnemonic}</td>
                  <td>{instruction.operands}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!result ? <p className="text-sm text-slate-500">No disassembly has run.</p> : null}
        </div>
      </PanelCard>
    </section>
  );
}
