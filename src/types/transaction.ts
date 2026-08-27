import type { Transaction } from './database';

export interface TransactionWithDetails extends Transaction {
  sender_name?: string;
  sender_account?: string;
  recipient_name?: string;
  recipient_account?: string;
}
