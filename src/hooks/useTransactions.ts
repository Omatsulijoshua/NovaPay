import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getTransactions, subscribeToTransactions } from '../services/transactions';
import type { TransactionWithDetails } from '../types/transaction';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    fetchTransactions();

    const subscription = subscribeToTransactions(user.id, () => {
      fetchTransactions();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchTransactions]);

  return { transactions, loading, error, refreshTransactions: fetchTransactions };
}
