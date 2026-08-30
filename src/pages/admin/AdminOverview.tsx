import { Users, ArrowLeftRight, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminStats } from '../../hooks/useAdminData';
import { useAdminTransactions } from '../../hooks/useAdminData';
import StatCard from '../../components/admin/StatCard';
import { format } from 'date-fns';

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminOverview() {
  const { stats, dailyVolume, loading } = useAdminStats();
  const { transactions } = useAdminTransactions();

  const recentTx = transactions.slice(0, 5);

  const chartData = dailyVolume.map((d) => ({
    day: format(new Date(d.day), 'MMM d'),
    volume: Number(d.volume),
    count: Number(d.count),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></div>
            <div className="relative rounded-full h-8 w-8 bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
          </div>
          <span className="text-slate-500 text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Platform Overview</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time stats for the NovaPay platform</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats?.total_users?.toLocaleString() ?? '0'}
          subtitle="Registered accounts"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Total Transactions"
          value={stats?.total_transactions?.toLocaleString() ?? '0'}
          subtitle="All time transfers"
          icon={ArrowLeftRight}
          color="blue"
        />
        <StatCard
          title="Total Volume"
          value={formatNGN(stats?.total_volume ?? 0)}
          subtitle="All time transfer volume"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Today's Activity"
          value={stats?.transactions_today?.toLocaleString() ?? '0'}
          subtitle={`${formatNGN(stats?.volume_today ?? 0)} transferred today`}
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-slate-800 font-semibold text-base mb-6">Transaction Volume (Last 7 Days)</h3>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No transaction data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatNGN(Number(value)), 'Volume']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="volume" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold text-base">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTx.length === 0 ? (
            <p className="px-6 py-8 text-center text-slate-400 text-sm">No transactions yet</p>
          ) : (
            recentTx.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                    <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-xs">
                      {tx.sender_name ?? 'Unknown'} → {tx.recipient_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400">{tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{formatNGN(tx.amount)}</p>
                  <p className="text-xs text-slate-400">{format(new Date(tx.created_at), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
