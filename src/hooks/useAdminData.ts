import { useState, useEffect } from 'react';
import { adminGetAllUsers, adminGetAllTransactions, adminGetStats, adminGetDailyVolume } from '../services/admin';
import type { AdminUser, AdminTransaction, AdminStats, DailyVolume } from '../types/database';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminGetStats(), adminGetDailyVolume()])
      .then(([s, d]) => { setStats(s); setDailyVolume(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, dailyVolume, loading, error };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetAllUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetAllTransactions()
      .then(setTransactions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { transactions, loading, error };
}
