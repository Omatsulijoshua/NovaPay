import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { useTransactions } from '../hooks/useTransactions';
import WalletCard from '../components/WalletCard';
import TransactionItem from '../components/TransactionItem';
import { Send, ArrowDownLeft, History, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const { wallet, loading: walletLoading } = useWallet();
  const { transactions, loading: txLoading } = useTransactions();
  const navigate = useNavigate();

  // Determine Greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.full_name ? profile.full_name.split(' ')[0] : 'User';

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold text-slate-500">{getGreeting()},</h2>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0">
          {displayName} 👋
        </h1>
      </div>

      {/* Wallet Card */}
      {walletLoading ? (
        <div className="h-44 bg-slate-200 rounded-2xl animate-pulse"></div>
      ) : (
        <WalletCard
          balance={wallet?.balance ?? 0}
          accountNumber={profile?.account_number ?? '0000000000'}
        />
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          to="/send"
          className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl mb-2">
            <Send className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 text-center">Send Money</span>
        </Link>

        <Link
          to="/receive"
          className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl mb-2">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 text-center">Receive Money</span>
        </Link>

        <Link
          to="/transactions"
          className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl mb-2">
            <History className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 text-center">History</span>
        </Link>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Transactions</h3>
          {transactions.length > 0 && (
            <Link
              to="/transactions"
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {txLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-400 font-semibold">No Transactions Yet</p>
            <p className="text-[10px] text-slate-400 mt-1">Your transfer history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 3).map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                currentUserId={profile?.id ?? ''}
                onClick={() => navigate(`/transactions/${tx.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
