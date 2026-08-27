import { useState } from 'react';
import { Copy, Eye, EyeOff, Check } from 'lucide-react';
import { formatNaira } from '../utils/currency';
import { formatAccountNumber } from '../utils/accountNumber';
import { useToast } from '../hooks/useToast';

interface WalletCardProps {
  balance: number;
  accountNumber: string;
}

export default function WalletCard({ balance, accountNumber }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      showToast('Account number copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy account number.', 'error');
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg space-y-6 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
      <div className="absolute left-0 bottom-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-emerald-100/80 text-xs font-semibold uppercase tracking-wider">
          <span>Available Balance</span>
          <button onClick={() => setShowBalance(!showBalance)} className="hover:text-white transition-colors p-1" type="button">
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          {showBalance ? formatNaira(balance) : '₦ ••••••••'}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">Account Number</span>
          <span className="font-mono text-base font-semibold tracking-wide">
            {formatAccountNumber(accountNumber)}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all p-2 rounded-xl flex items-center space-x-1.5 text-emerald-50 text-xs"
          type="button"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-300" />
              <span className="font-medium text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-medium">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
