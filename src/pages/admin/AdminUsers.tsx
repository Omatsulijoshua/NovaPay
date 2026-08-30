import { useState } from 'react';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../../hooks/useAdminData';
import { format } from 'date-fns';

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminUsers() {
  const { users, loading } = useAdminUsers();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(query.toLowerCase()) ||
    u.email?.toLowerCase().includes(query.toLowerCase()) ||
    u.account_number.includes(query)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Users</h2>
          <p className="text-slate-500 text-sm mt-1">{users.length} registered accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or account..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account No.</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-emerald-100 p-2 rounded-full flex-shrink-0">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{user.account_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">{formatNGN(user.balance)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
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
