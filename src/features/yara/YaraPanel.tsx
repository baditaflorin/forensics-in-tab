import { Download, Play, ShieldAlert } from 'lucide-react';
import { formatOffset } from '../../lib/bytes';
import { downloadCsvFile } from '../../lib/export';
import { EmptyState, PanelCard } from '../../ui/PanelCard';
import type { YaraScanResult } from './yaraEngine';
import { scanWithYaraSubset } from './yaraEngine';

interface YaraPanelProps {
  bytes?: Uint8Array;
  rules: string;
  onRulesChange: (rules: string) => void;
  onResult: (result: YaraScanResult) => void;
  result?: YaraScanResult;
}

export function YaraPanel({ bytes, rules, onRulesChange, onResult, result }: YaraPanelProps) {
  if (!bytes) {
    return <EmptyState label="Load evidence to run YARA rules." />;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <PanelCard
        title="YARA Rules"
        icon={<ShieldAlert className="text-amberline" aria-hidden="true" />}
      >
        <textarea
          className="mt-4 h-72 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm"
          value={rules}
          spellCheck={false}
          onChange={(event) => onRulesChange(event.target.value)}
        />
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          type="button"
          onClick={() => {
            onResult(scanWithYaraSubset(rules, bytes));
          }}
        >
          <Play aria-hidden="true" size={17} />
          Run Rules
        </button>
      </PanelCard>

      <PanelCard
        title="Matches"
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slatewash disabled:cursor-not-allowed disabled:text-slate-400"
            disabled={!result}
            type="button"
            onClick={() =>
              result
                ? downloadCsvFile('forensics-in-tab-yara-matches.csv', [
                    ['rule', 'matched', 'string_id', 'offsets', 'sample'],
                    ...result.rules.flatMap((rule) =>
                      rule.strings.length > 0
                        ? rule.strings.map((match) => [
                            rule.rule,
                            String(rule.matched),
                            match.id,
                            match.offsets.join('|'),
                            match.sample
                          ])
                        : [[rule.rule, String(rule.matched), '', '', '']]
                    )
                  ])
                : undefined
            }
          >
            <Download aria-hidden="true" size={16} />
            Export CSV
          </button>
        }
      >
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
      </PanelCard>
    </section>
  );
}
