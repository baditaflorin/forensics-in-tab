export default function App() {
  return (
    <main className="min-h-screen bg-slatewash text-ink">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal">Mode A</p>
        <h1 className="mt-3 text-4xl font-semibold">Forensics in Tab</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-700">
          Browser-only forensic triage for disk images, memory dumps, YARA rules, and
          disassembly. Evidence stays local.
        </p>
      </section>
    </main>
  );
}
