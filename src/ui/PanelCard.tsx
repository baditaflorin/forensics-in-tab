import type { PropsWithChildren, ReactNode } from 'react';

interface PanelCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PanelCard({ title, description, icon, actions, children }: PanelCardProps) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {icon ? <div className="mt-0.5 text-signal">{icon}</div> : null}
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2 print:hidden">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <section className="rounded-lg bg-white p-5 text-sm text-slate-500 shadow-panel">
      {label}
    </section>
  );
}
