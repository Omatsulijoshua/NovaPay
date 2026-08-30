import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Wallet, ArrowLeftRight } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminData';
import { useAdminTransactions } from '../../hooks/useAdminData';
import { format } from 'date-fns';

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(amount);
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, loading: usersLoading } = useAdminUsers();
  const { transactions, loading: txLoading } = useAdminTransactions();

  const user = users.find((u) => u.id === id);
  const userTx = transactions.filter((t) => t.sender_id === id || t.recipient_id === id);

  if (usersLoading || txLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></div>
          <div className="relative rounded-full h-8 w-8 bg-emerald-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>User not found.</p>
        <button onClick={() => navigate('/admin/users')} className="mt-4 text-emerald-600 text-sm underline">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center space-x-2 text-slate-500 hover:text-emerald-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Users</span>
      </button>

      <h2 className="text-2xl font-bold text-slate-800">User Detail</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start space-x-5">
        <div className="bg-emerald-100 p-4 rounded-2xl flex-shrink-0">
          <User className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Full Name</p>
            <p className="text-slate-800 font-semibold mt-0.5">{user.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email</p>
            <p className="text-slate-800 font-semibold mt-0.5">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account Number</p>
            <p className="text-slate-800 font-mono font-semibold mt-0.5 bg-slate-100 inline-block px-2 py-0.5 rounded">{user.account_number}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Role</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-medium ${
              user.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {user.role}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Joined</p>
            <p className="text-slate-800 font-semibold mt-0.5">{format(new Date(user.created_at), 'MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="bg-emerald-600 rounded-2xl p-6 flex items-center space-x-4">
        <div className="bg-white/20 p-3 rounded-xl">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-emerald-200 text-sm font-medium">Wallet Balance</p>
          <p className="text-white text-3xl font-bold mt-0.5">{formatNGN(user.balance)}</p>
          <p className="text-emerald-200 text-xs mt-1">{user.currency}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-slate-800 font-semibold">Transaction History ({userTx.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {userTx.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-400 text-sm">No transactions for this user</p>
          ) : (
            userTx.map((tx) => {
              const isSender = tx.sender_id === id;
              return (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSender ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      <ArrowLeftRight className={`h-4 w-4 ${isSender ? 'text-red-500' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {isSender ? `To: ${tx.recipient_name ?? 'Unknown'}` : `From: ${tx.sender_name ?? 'Unknown'}`}
                      </p>
                      <p className="text-xs text-slate-400">{tx.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isSender ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isSender ? '-' : '+'}{formatNGN(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{format(new Date(tx.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
