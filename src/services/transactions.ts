import { supabase } from '../lib/supabase';
import type { TransactionWithDetails } from '../types/transaction';

export async function getTransactions() {
  const { data, error } = await supabase.rpc('get_transaction_history');
  
  if (error) throw error;
  return data as TransactionWithDetails[];
}

export async function getTransactionDetails(id: string) {
  const transactions = await getTransactions();
  return transactions.find(t => t.id === id) || null;
}

export function subscribeToTransactions(userId: string, onNewTransaction: () => void) {
  return supabase
    .channel(`user-transactions:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
      },
      () => {
        onNewTransaction();
      }
    )
    .subscribe();
}
