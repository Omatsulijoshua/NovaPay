import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatAccountNumber } from '../utils/accountNumber';
import { useToast } from '../hooks/useToast';

interface AccountNumberProps {
  value: string;
  showCopy?: boolean;
}

export default function AccountNumber({ value, showCopy = true }: AccountNumberProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast('Account number copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy account number:', err);
      showToast('Failed to copy account number.', 'error');
    }
  };

  return (
    <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-sm font-bold text-slate-700">
      <span>{formatAccountNumber(value)}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
          type="button"
          title="Copy Account Number"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
