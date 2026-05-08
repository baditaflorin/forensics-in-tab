import type { LucideIcon } from 'lucide-react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (tab: T) => void;
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-lg bg-white p-1 shadow-panel">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                selected ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slatewash'
              }`}
              type="button"
              onClick={() => onChange(tab.id)}
            >
              <Icon aria-hidden="true" size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
