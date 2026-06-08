import { useState, useEffect, useCallback } from 'react';
import StatsBar from '../components/StatsBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LanguageBadge from '../components/LanguageBadge.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ActionButtons({ app, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);

  if (app.status !== 'pending') {
    return <span className="text-slate-600 text-xs italic">No actions</span>;
  }

  async function updateStatus(newStatus) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${app.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        onStatusUpdate(updated);
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        id={`btn-approve-${app.id}`}
        disabled={loading}
        onClick={() => updateStatus('approved')}
        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold
                   ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Approve
      </button>
      <button
        id={`btn-reject-${app.id}`}
        disabled={loading}
        onClick={() => updateStatus('rejected')}
        className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold
                   ring-1 ring-red-500/30 hover:bg-red-500/25 transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reject
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({ total: 0, totalAmount: 0, pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_BASE}/api/summary`);
      if (res.ok) setSummary(await res.json());
    } catch {
      // non-critical
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchApplications = useCallback(async (filter) => {
    setLoadingApps(true);
    setError('');
    try {
      const url =
        filter && filter !== 'all'
          ? `${API_BASE}/api/applications?status=${filter}`
          : `${API_BASE}/api/applications`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      setApplications(await res.json());
    } catch {
      setError('Could not load applications. Please try again.');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchApplications(statusFilter);
  }, [fetchSummary, fetchApplications, statusFilter]);

  function handleStatusUpdate(updatedApp) {
    setApplications((prev) =>
      prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
    );
    fetchSummary();
  }

  const filtered = search.trim()
    ? applications.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.mobile.includes(search)
      )
    : applications;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Loan <span className="text-amber-400">Dashboard</span>
        </h1>
        <p className="text-slate-400 mt-1">Monitor and manage all loan applications.</p>
      </div>

      {/* Stats Bar */}
      <div className="mb-8">
        <StatsBar summary={summary} loading={loadingStats} />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 bg-navy-800 border border-slate-700/50 rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-150 ${
                statusFilter === f
                  ? 'bg-amber-500 text-navy-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1111 5a6 6 0 016 6z" />
          </svg>
          <input
            id="search-applications"
            type="text"
            placeholder="Search by name or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : loadingApps ? (
          <div className="p-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 mb-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded flex-1" />
                <div className="h-4 bg-slate-700 rounded w-24" />
                <div className="h-4 bg-slate-700 rounded w-20" />
                <div className="h-4 bg-slate-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No applications found</p>
            <p className="text-slate-600 text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Applicant', 'Mobile', 'Amount', 'Purpose', 'Language', 'Status', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((app) => (
                  <tr key={app.id} className="table-row-hover transition-colors duration-100">
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-100 whitespace-nowrap">
                      {app.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 whitespace-nowrap font-mono">
                      {app.mobile}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-amber-400 font-semibold whitespace-nowrap">
                      {formatINR(app.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-300 max-w-[160px] truncate">
                      {app.purpose}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <LanguageBadge language={app.language} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <ActionButtons app={app} onStatusUpdate={handleStatusUpdate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row count */}
        {!loadingApps && !error && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-500">
            Showing {filtered.length} of {applications.length} applications
          </div>
        )}
      </div>
    </main>
  );
}
