import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Share2, Check } from 'lucide-react';
import { formatAccountNumber } from '../utils/accountNumber';

export default function ReceiveMoney() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const accountNumber = profile?.account_number || '';
  const fullName = profile?.full_name || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy account number:', err);
    }
  };

  const handleShare = async () => {
    const shareText = `NovaPay Digital Wallet Details:\nName: ${fullName}\nAccount Number: ${accountNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My NovaPay Account Details',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy share text to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.error('Failed to copy details:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Receive Money</h1>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your Account Details</span>
          <h2 className="text-lg font-bold text-slate-800">{fullName}</h2>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
          {accountNumber ? (
            <QRCodeSVG
              value={accountNumber}
              size={180}
              bgColor={"#f8fafc"}
              fgColor={"#047857"}
              level={"H"}
              includeMargin={false}
            />
          ) : (
            <div className="w-44 h-44 bg-slate-200 rounded-lg animate-pulse"></div>
          )}
        </div>

        <div className="space-y-1 w-full">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Number</span>
          <span className="font-mono text-xl font-extrabold text-slate-800 tracking-wide">
            {accountNumber ? formatAccountNumber(accountNumber) : '00000 00000'}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 font-semibold text-xs rounded-xl"
            type="button"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Number</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white font-semibold text-xs rounded-xl shadow-sm"
            type="button"
          >
            <Share2 className="h-4 w-4" />
            <span>{shared ? 'Details Copied' : 'Share Details'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
