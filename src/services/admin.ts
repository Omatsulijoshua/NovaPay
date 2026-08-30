import { supabase } from '../lib/supabase';
import type { AdminUser, AdminTransaction, AdminStats, DailyVolume } from '../types/database';

export async function adminGetAllUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc('admin_get_all_users');
  if (error) throw error;
  return data as AdminUser[];
}

export async function adminGetAllTransactions(): Promise<AdminTransaction[]> {
  const { data, error } = await supabase.rpc('admin_get_all_transactions');
  if (error) throw error;
  return data as AdminTransaction[];
}

export async function adminGetStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_get_stats');
  if (error) throw error;
  return data as AdminStats;
}

export async function adminGetDailyVolume(): Promise<DailyVolume[]> {
  const { data, error } = await supabase.rpc('admin_get_daily_volume');
  if (error) throw error;
  return data as DailyVolume[];
}
