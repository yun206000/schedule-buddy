export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="badge-shift">🔔 值班</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="badge-leave">🌴 休假</span>
      </div>
    </div>
  );
}
