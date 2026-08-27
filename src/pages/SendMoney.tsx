import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { lookupRecipient, transferMoney } from '../services/transfers';
import type { RecipientLookupResult, TransferResult } from '../services/transfers';
import { formatNaira } from '../utils/currency';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { ArrowLeft, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SendMoney() {
  const { profile } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const navigate = useNavigate();

  // Form states
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Async states
  const [recipient, setRecipient] = useState<RecipientLookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Transfer action states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<TransferResult | null>(null);

  // Auto lookup when account number reaches 10 digits
  useEffect(() => {
    const triggerLookup = async () => {
      if (accountNumber.length === 10) {
        if (/^\d{10}$/.test(accountNumber)) {
          setLookupLoading(true);
          setLookupError(null);
          setRecipient(null);
          try {
            const result = await lookupRecipient(accountNumber);
            if (result) {
              // Ensure sender is not lookup recipient
              if (result.account_number === profile?.account_number) {
                setLookupError('You cannot transfer money to your own account.');
              } else {
                setRecipient(result);
              }
            } else {
              setLookupError('Account not found. Please check the account number and try again.');
            }
          } catch (err: any) {
            setLookupError('Failed to verify account number. Please try again.');
          } finally {
            setLookupLoading(false);
          }
        } else {
          setLookupError('Account number must contain digits only.');
        }
      } else {
        // Reset recipient state if length is not 10
        setRecipient(null);
        setLookupError(null);
      }
    };

    triggerLookup();
  }, [accountNumber, profile]);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setTransferError('Enter a valid amount greater than ₦0.');
      return;
    }

    if (wallet && parsedAmount > wallet.balance) {
      setTransferError('Insufficient Balance. You do not have enough funds to complete this transfer.');
      return;
    }

    if (!recipient) {
      setTransferError('Please enter a valid recipient account number.');
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmTransfer = async () => {
    setConfirmOpen(false);
    setTransferLoading(true);
    setTransferError(null);

    try {
      const parsedAmount = parseFloat(amount);
      const result = await transferMoney(accountNumber, parsedAmount, description);
      
      setTransferSuccess(result);
      await refreshWallet();
      
      // Fire confetti celebration
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setTransferError(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setTransferLoading(false);
    }
  };

  if (transferSuccess) {
    return (
      <div className="space-y-6 py-6 flex flex-col items-center">
        {/* Success Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 animate-bounce" />
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-emerald-600">Transfer Successful</h2>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
              {formatNaira(transferSuccess.amount)}
            </span>
          </div>

          <div className="w-full space-y-3 pt-4 border-t border-slate-100 text-left text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-semibold">Sent to</span>
              <span className="text-slate-800 font-bold">{transferSuccess.recipient_name}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-semibold">Account Number</span>
              <span className="text-slate-800 font-mono font-bold">{transferSuccess.recipient_account}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-semibold">Reference</span>
              <span className="text-slate-800 font-mono font-semibold">{transferSuccess.reference}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-semibold">Date</span>
              <span className="text-slate-800 font-bold">
                {new Date(transferSuccess.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
            Done
          </Button>
          <Button variant="outline" fullWidth onClick={() => navigate('/transactions')}>
            View Receipt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Send Money</h1>
      </div>

      {transferError && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
          {transferError}
        </div>
      )}

      <form onSubmit={handleOpenConfirm} className="space-y-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        {/* Recipient Account Input */}
        <div className="space-y-2">
          <Input
            label="Recipient Account Number"
            type="text"
            id="accountNumber"
            maxLength={10}
            placeholder="1029384756"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            disabled={transferLoading}
            required
          />

          {/* Verification States */}
          {lookupLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium pl-1">
              <svg className="animate-spin h-3.5 w-3.5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying account number...</span>
            </div>
          )}

          {recipient && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center space-x-3 text-emerald-800">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                <User className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold block">Recipient Found</span>
                <span className="font-semibold">{recipient.full_name}</span>
              </div>
            </div>
          )}

          {lookupError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
              {lookupError}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <Input
          label="Amount (₦)"
          type="number"
          step="0.01"
          id="amount"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={transferLoading}
          required
        />

        {/* Description Input */}
        <Input
          label="Description"
          type="text"
          id="description"
          placeholder="What is this for? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={transferLoading}
        />

        <Button
          type="submit"
          loading={transferLoading}
          disabled={!recipient || lookupLoading}
          fullWidth
        >
          Next
        </Button>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Transfer"
      >
        <div className="space-y-5">
          <div className="text-center pb-2 border-b border-slate-100">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Amount to Send</span>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1 block">
              {formatNaira(amount)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Recipient Name</span>
              <span className="text-slate-800 font-bold">{recipient?.full_name}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-semibold">Account Number</span>
              <span className="text-slate-800 font-mono font-bold">{recipient?.account_number}</span>
            </div>

            {description && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-semibold">Description</span>
                <span className="text-slate-800 font-medium italic">{description}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-2 text-amber-800 text-[10px] leading-relaxed">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-semibold">
              Warning: You are about to transfer money. This operation is atomic and demo-only. Double-check details.
            </span>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleConfirmTransfer} loading={transferLoading}>
              Confirm Transfer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
