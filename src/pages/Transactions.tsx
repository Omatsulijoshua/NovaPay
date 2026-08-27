import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import TransactionItem from '../components/TransactionItem';
import Input from '../components/Input';
import { ArrowLeft, Search, Filter } from 'lucide-react';

type FilterType = 'ALL' | 'SENT' | 'RECEIVED';

export default function Transactions() {
  const { profile } = useAuth();
  const { transactions, loading, error } = useTransactions();
  const navigate = useNavigate();

  // Filters state
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Group transactions by date helper
  const groupTransactionsByDate = (txs: typeof transactions) => {
    const groups: { [key: string]: typeof transactions } = {};
    
    txs.forEach((tx) => {
      const date = new Date(tx.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dateKey = '';
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return groups;
  };

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    const isIncoming = tx.recipient_id === profile?.id;
    
    // Type Filter
    if (filterType === 'SENT' && isIncoming) return false;
    if (filterType === 'RECEIVED' && !isIncoming) return false;

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const partnerName = isIncoming 
        ? tx.sender_name?.toLowerCase() || '' 
        : tx.recipient_name?.toLowerCase() || '';
      const reference = tx.reference.toLowerCase();
      const description = tx.description?.toLowerCase() || '';
      
      return partnerName.includes(query) || reference.includes(query) || description.includes(query);
    }

    return true;
  });

  const transactionGroups = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Transaction History</h1>
      </div>

      {/* Filter Options */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, reference, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['ALL', 'SENT', 'RECEIVED'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                filterType === tab
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              type="button"
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 w-24 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <Filter className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">No Transactions Found</p>
          <p className="text-[10px] text-slate-400 mt-1">Try resetting your filters or keyword query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(transactionGroups).map((dateHeader) => (
            <div key={dateHeader} className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                {dateHeader}
              </h3>
              <div className="space-y-2">
                {transactionGroups[dateHeader].map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    currentUserId={profile?.id ?? ''}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
