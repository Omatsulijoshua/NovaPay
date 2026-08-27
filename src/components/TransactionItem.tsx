import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { TransactionWithDetails } from '../types/transaction';
import { formatNaira } from '../utils/currency';

interface TransactionItemProps {
  transaction: TransactionWithDetails;
  currentUserId: string;
  onClick?: () => void;
}

export default function TransactionItem({ transaction, currentUserId, onClick }: TransactionItemProps) {
  const isIncoming = transaction.recipient_id === currentUserId;
  const partnerName = isIncoming 
    ? transaction.sender_name || 'Unknown Sender' 
    : transaction.recipient_name || 'Unknown Recipient';
  
  const dateObj = new Date(transaction.created_at);
  const formattedDate = dateObj.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-150 text-left active:scale-[0.99] shadow-sm"
      type="button"
    >
      <div className="flex items-center space-x-3">
        {/* Icon Badge */}
        <div className={`p-2.5 rounded-xl ${
          isIncoming ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {isIncoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
        </div>

        {/* Transaction details */}
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            {isIncoming ? 'Received Money' : 'Sent Money'}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase block tracking-wider mt-0.5">
            {isIncoming ? `From: ${partnerName}` : `To: ${partnerName}`}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Amount and Status */}
      <div className="text-right flex flex-col items-end space-y-1">
        <span className={`text-sm font-bold ${
          isIncoming ? 'text-emerald-600' : 'text-slate-800'
        }`}>
          {isIncoming ? `+${formatNaira(transaction.amount)}` : `-${formatNaira(transaction.amount)}`}
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
          transaction.status === 'SUCCESS'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : transaction.status === 'PENDING'
            ? 'bg-amber-50 text-amber-700 border border-amber-100'
            : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {transaction.status}
        </span>
      </div>
    </button>
  );
}
