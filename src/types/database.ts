export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  account_number: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Transaction {
  id: string;
  reference: string;
  sender_id: string | null;
  recipient_id: string | null;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  created_at: string;
  sender?: Profile | null;
  recipient?: Profile | null;
}
