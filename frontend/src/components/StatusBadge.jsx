const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
};

const STATUS_DOTS = {
  pending: 'bg-amber-400',
  approved: 'bg-emerald-400',
  rejected: 'bg-red-400',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-700 text-slate-300';
  const dot = STATUS_DOTS[status] ?? 'bg-slate-400';

  return (
    <span className={`badge ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
