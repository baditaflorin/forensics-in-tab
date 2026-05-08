import { Play, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { formatOffset } from '../../lib/bytes';
import type { YaraScanResult } from './yaraEngine';
import { scanWithYaraSubset } from './yaraEngine';

const defaultRules = `rule Suspicious_Triage {
  strings:
    $mz = { 4D 5A }
    $http = "http://" nocase
    $cmd = "cmd.exe" nocase
  condition:
    any of them
}`;

interface YaraPanelProps {
  bytes?: Uint8Array;
  onResult: (result: YaraScanResult) => void;
  result?: YaraScanResult;
}

export function YaraPanel({ bytes, onResult, result }: YaraPanelProps) {
  const [rules, setRules] = useState(defaultRules);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-lg bg-white p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-amberline" aria-hidden="true" />
          <h2 className="text-xl font-semibold">YARA Rules</h2>
        </div>
        <textarea
          className="mt-4 h-72 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm"
          value={rules}
          spellCheck={false}
          onChange={(event) => setRules(event.target.value)}
        />
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!bytes}
          type="button"
          onClick={() => {
            if (bytes) {
              onResult(scanWithYaraSubset(rules, bytes));
            }
          }}
        >
          <Play aria-hidden="true" size={17} />
          Run Rules
        </button>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold">Matches</h2>
        <div className="mt-4 grid gap-3">
          {result?.rules.map((rule) => (
            <article key={rule.rule} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{rule.rule}</h3>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    rule.matched ? 'bg-teal-100 text-teal-800' : 'bg-slatewash text-slate-600'
                  }`}
                >
                  {rule.matched ? 'Matched' : 'No match'}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {rule.strings.map((match) => (
                  <p key={match.id} className="text-sm">
                    <span className="font-mono">${match.id}</span>{' '}
                    <span className="text-slate-600">
                      {match.offsets.slice(0, 8).map(formatOffset).join(', ')}
                    </span>
                  </p>
                ))}
              </div>
            </article>
          ))}
          {result?.errors.map((error) => (
            <p key={error} className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          ))}
          {!result ? <p className="text-sm text-slate-500">No scan has run.</p> : null}
        </div>
      </div>
    </section>
  );
}
