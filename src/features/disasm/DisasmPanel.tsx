import { Play, TerminalSquare } from 'lucide-react';
import { useState } from 'react';
import type { DisasmArchitecture, DisasmResult } from './disasm';
import { disassemble } from './disasm';

interface DisasmPanelProps {
  bytes?: Uint8Array;
  result?: DisasmResult;
  onResult: (result: DisasmResult) => void;
}

export function DisasmPanel({ bytes, result, onResult }: DisasmPanelProps) {
  const [architecture, setArchitecture] = useState<DisasmArchitecture>('x86-64');
  const [offset, setOffset] = useState('0');
  const [length, setLength] = useState('192');
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!bytes) {
      return;
    }
    setBusy(true);
    try {
      onResult(
        await disassemble(bytes, {
          architecture,
          offset: Number(offset),
          length: Number(length),
          address: Number(offset)
        })
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[22rem_1fr]">
      <div className="rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <TerminalSquare className="text-evidence" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Disassembly</h2>
        </div>
        <label className="mt-4 block text-sm font-medium">
          Architecture
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={architecture}
            onChange={(event) => setArchitecture(event.target.value as DisasmArchitecture)}
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
            value={offset}
            onChange={(event) => setOffset(event.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm font-medium">
          Bytes
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            min="1"
            inputMode="numeric"
            value={length}
            onChange={(event) => setLength(event.target.value)}
          />
        </label>
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!bytes || busy}
          type="button"
          onClick={run}
        >
          <Play aria-hidden="true" size={17} />
          {busy ? 'Running...' : 'Disassemble'}
        </button>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Instructions</h2>
          {result ? (
            <span className="rounded bg-slatewash px-2 py-1 text-xs font-semibold">
              {result.engine}
            </span>
          ) : null}
        </div>
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
      </div>
    </section>
  );
}
