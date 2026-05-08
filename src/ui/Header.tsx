import { Github, HeartHandshake, ShieldCheck } from 'lucide-react';
import type { BuildInfo } from '../lib/buildInfo';

interface HeaderProps {
  buildInfo?: BuildInfo;
}

export function Header({ buildInfo }: HeaderProps) {
  const repo = buildInfo?.repository ?? 'https://github.com/baditaflorin/forensics-in-tab';
  const paypal = buildInfo?.paypal ?? 'https://www.paypal.com/paypalme/florinbadita';

  return (
    <header className="border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <ShieldCheck aria-hidden="true" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Forensics in Tab</h1>
              <p className="text-sm text-slate-600">
                Disk, memory, rules, disassembly. Static by design.
              </p>
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-semibold hover:bg-slatewash"
            href={repo}
            rel="noreferrer"
            target="_blank"
          >
            <Github aria-hidden="true" size={17} />
            Star on GitHub
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-semibold hover:bg-slatewash"
            href={paypal}
            rel="noreferrer"
            target="_blank"
          >
            <HeartHandshake aria-hidden="true" size={17} />
            PayPal
          </a>
          <span className="rounded-lg bg-slatewash px-3 py-2 font-mono text-xs">
            v{buildInfo?.version ?? 'dev'} · {buildInfo?.commit ?? 'dev'}
          </span>
        </nav>
      </div>
    </header>
  );
}
