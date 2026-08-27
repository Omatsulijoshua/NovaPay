import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getTransactionDetails } from '../services/transactions';
import type { TransactionWithDetails } from '../types/transaction';
import { formatNaira } from '../utils/currency';
import { ArrowLeft, Printer, Share2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TransactionDetails() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [tx, setTx] = useState<TransactionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getTransactionDetails(id);
        if (data) {
          setTx(data);
        } else {
          setError('Transaction details not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!tx) return;
    const shareText = `NovaPay Transfer Receipt\nStatus: ${tx.status}\nAmount: ${formatNaira(tx.amount)}\nRef: ${tx.reference}\nDate: ${new Date(tx.created_at).toLocaleString()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NovaPay Transaction Receipt',
          text: shareText,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Receipt text copied to clipboard!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-slate-500 text-xs font-semibold">Loading receipt details...</span>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <p className="text-sm text-slate-600 font-bold">{error || 'Receipt not found'}</p>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs font-bold text-emerald-600 hover:underline"
          type="button"
        >
          Back to History
        </button>
      </div>
    );
  }

  const isIncoming = tx.recipient_id === profile?.id;
  const dateObj = new Date(tx.created_at);
  const formattedDate = dateObj.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6 print-container">
      {/* Top bar (Hidden when printing via CSS media queries) */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Receipt Details</h1>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 print-receipt-container">
        
        {/* Receipt Header Banner */}
        <div className="text-center space-y-2 pb-4 border-b border-dashed border-slate-200">
          <div className="inline-flex bg-emerald-50 text-emerald-600 p-2.5 rounded-full mb-1">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Transaction Receipt</h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block">
            {tx.status}
          </span>
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight block pt-2">
            {isIncoming ? '+' : '-'}{formatNaira(tx.amount)}
          </span>
        </div>

        {/* Receipt Rows */}
        <div className="space-y-4 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Transaction Type</span>
            <span className="text-slate-800 font-bold uppercase">{tx.transaction_type}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Sender Name</span>
            <span className="text-slate-800 font-bold">{tx.sender_name || 'NovaPay Sandbox'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Sender Account</span>
            <span className="text-slate-800 font-mono font-bold">{tx.sender_account || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Recipient Name</span>
            <span className="text-slate-800 font-bold">{tx.recipient_name || 'NovaPay Sandbox'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Recipient Account</span>
            <span className="text-slate-800 font-mono font-bold">{tx.recipient_account || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Reference</span>
            <span className="text-slate-800 font-mono font-bold">{tx.reference}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-400 font-semibold">Description</span>
            <span className="text-slate-800 font-semibold italic">{tx.description || 'No description'}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-400 font-semibold">Date and Time</span>
            <span className="text-slate-800 font-bold">{formattedDate}</span>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold italic tracking-wide uppercase">
          *** NovaPay Demo Transaction Receipt ***
        </div>
      </div>

      {/* Receipt Action Buttons (no-print) */}
      <div className="grid grid-cols-2 gap-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 font-semibold text-xs rounded-xl"
          type="button"
        >
          <Printer className="h-4 w-4" />
          <span>Print Receipt</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white font-semibold text-xs rounded-xl shadow-sm"
          type="button"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Receipt</span>
        </button>
      </div>
    </div>
  );
}
