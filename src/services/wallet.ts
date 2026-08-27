import { supabase } from '../lib/supabase';
import type { Wallet } from '../types/database';

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  return data as Wallet;
}

export function subscribeToWallet(userId: string, onUpdate: (wallet: Wallet) => void) {
  return supabase
    .channel(`wallet:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'wallets',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as Wallet);
      }
    )
    .subscribe();
}
