export default function AuthLoadingPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[50vh] py-16">
      <div
        className="w-10 h-10 border-4 border-slate-200 border-t-emerald-700 rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-700">Loading your account…</p>
    </div>
  );
}
