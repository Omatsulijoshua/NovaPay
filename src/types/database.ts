export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  account_number: string;
  avatar_url: string | null;
  role: string;
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

// Admin types
export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  account_number: string;
  role: string;
  balance: number;
  currency: string;
  created_at: string;
}

export interface AdminTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  description: string | null;
  created_at: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_account: string | null;
  recipient_id: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
}

export interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_volume: number;
  transactions_today: number;
  volume_today: number;
}

export interface DailyVolume {
  day: string;
  volume: number;
  count: number;
}
