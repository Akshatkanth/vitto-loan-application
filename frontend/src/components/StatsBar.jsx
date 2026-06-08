function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

export default function StatsBar({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-3 bg-slate-700 rounded w-2/3 mb-3" />
            <div className="h-7 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard label="Total Applications" value={summary.total} />
      <StatCard
        label="Total Loan Amount"
        value={formatINR(summary.totalAmount)}
        accent="text-amber-400"
      />
      <StatCard label="Pending" value={summary.pending} accent="text-amber-400" />
      <StatCard label="Approved" value={summary.approved} accent="text-emerald-400" />
      <StatCard label="Rejected" value={summary.rejected} accent="text-red-400" />
    </div>
  );
}
