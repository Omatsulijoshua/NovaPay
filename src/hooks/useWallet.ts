import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getWallet, subscribeToWallet } from '../services/wallet';
import type { Wallet } from '../types/database';

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getWallet(user.id);
      setWallet(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      return;
    }

    fetchWallet();

    const subscription = subscribeToWallet(user.id, (updatedWallet) => {
      setWallet(updatedWallet);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchWallet]);

  return { wallet, loading, error, refreshWallet: fetchWallet };
}
