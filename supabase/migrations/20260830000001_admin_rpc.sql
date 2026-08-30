-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Admin function: get all users with balances
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  account_number VARCHAR(10),
  role TEXT,
  balance NUMERIC(18,2),
  currency VARCHAR(3),
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT p.role INTO caller_role FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden: admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.account_number,
    p.role,
    COALESCE(w.balance, 0) AS balance,
    COALESCE(w.currency, 'NGN') AS currency,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.wallets w ON w.user_id = p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function: get all transactions with names
CREATE OR REPLACE FUNCTION public.admin_get_all_transactions()
RETURNS TABLE (
  id UUID,
  reference VARCHAR(50),
  amount NUMERIC(18,2),
  currency VARCHAR(3),
  transaction_type VARCHAR(30),
  status VARCHAR(20),
  description TEXT,
  created_at TIMESTAMPTZ,
  sender_id UUID,
  sender_name TEXT,
  sender_account VARCHAR(10),
  recipient_id UUID,
  recipient_name TEXT,
  recipient_account VARCHAR(10)
) AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT p.role INTO caller_role FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden: admin access required';
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.reference,
    t.amount,
    t.currency,
    t.transaction_type,
    t.status,
    t.description,
    t.created_at,
    t.sender_id,
    sp.full_name AS sender_name,
    sp.account_number AS sender_account,
    t.recipient_id,
    rp.full_name AS recipient_name,
    rp.account_number AS recipient_account
  FROM public.transactions t
  LEFT JOIN public.profiles sp ON t.sender_id = sp.id
  LEFT JOIN public.profiles rp ON t.recipient_id = rp.id
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function: get platform stats
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSONB AS $$
DECLARE
  caller_role TEXT;
  total_users INT;
  total_transactions INT;
  total_volume NUMERIC(18,2);
  transactions_today INT;
  volume_today NUMERIC(18,2);
BEGIN
  SELECT p.role INTO caller_role FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden: admin access required';
  END IF;

  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*), COALESCE(SUM(amount),0) INTO total_transactions, total_volume FROM public.transactions;
  SELECT COUNT(*), COALESCE(SUM(amount),0) INTO transactions_today, volume_today
    FROM public.transactions
    WHERE created_at >= CURRENT_DATE;

  RETURN jsonb_build_object(
    'total_users', total_users,
    'total_transactions', total_transactions,
    'total_volume', total_volume,
    'transactions_today', transactions_today,
    'volume_today', volume_today
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin daily volume for chart (last 7 days)
CREATE OR REPLACE FUNCTION public.admin_get_daily_volume()
RETURNS TABLE (day DATE, volume NUMERIC(18,2), count BIGINT) AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT p.role INTO caller_role FROM public.profiles p WHERE p.id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden: admin access required';
  END IF;

  RETURN QUERY
  SELECT
    DATE(t.created_at) AS day,
    COALESCE(SUM(t.amount), 0) AS volume,
    COUNT(*) AS count
  FROM public.transactions t
  WHERE t.created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(t.created_at)
  ORDER BY day ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
