import { useState } from 'react';
import { Search, ArrowLeftRight } from 'lucide-react';
import { useAdminTransactions } from '../../hooks/useAdminData';
import { format } from 'date-fns';

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(amount);
}

export default function AdminTransactions() {
  const { transactions, loading } = useAdminTransactions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

  const filtered = transactions.filter((tx) => {
    const matchesQuery =
      tx.reference.toLowerCase().includes(query.toLowerCase()) ||
      tx.sender_name?.toLowerCase().includes(query.toLowerCase()) ||
      tx.recipient_name?.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || tx.status.toLowerCase() === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
        <p className="text-slate-500 text-sm mt-1">{transactions.length} total transactions on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference, name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div className="flex space-x-2">
          {(['all', 'completed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></div>
              <div className="relative rounded-full h-8 w-8 bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">From</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">To</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-emerald-50 p-1.5 rounded-lg">
                            <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{tx.reference}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">{tx.sender_name ?? '—'}</p>
                        <p className="text-xs text-slate-400 font-mono">{tx.sender_account ?? ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">{tx.recipient_name ?? '—'}</p>
                        <p className="text-xs text-slate-400 font-mono">{tx.recipient_account ?? ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">{formatNGN(tx.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status.toLowerCase() === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.status.toLowerCase() === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {format(new Date(tx.created_at), 'MMM d, yyyy · h:mm a')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
