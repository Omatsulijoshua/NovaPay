-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  account_number VARCHAR(10) UNIQUE NOT NULL,
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'NGN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  sender_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'NGN',
  transaction_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Database Indexes for optimized performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON public.profiles(account_number);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON public.transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id ON public.transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- RLS Policies
-- Profiles:
-- Allow authenticated users to select their own profile.
CREATE POLICY select_own_profile ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow authenticated users to update their own profile.
CREATE POLICY update_own_profile ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Wallets:
-- Allow users to select their own wallet.
CREATE POLICY select_own_wallet ON public.wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Transactions:
-- Allow users to view transactions where they are either sender or recipient.
CREATE POLICY select_own_transactions ON public.transactions
  FOR SELECT TO authenticated USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Database Trigger & Function for Automatic Profile and Wallet Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_acc_num VARCHAR(10);
  attempts INT := 0;
  starting_balance CONSTANT NUMERIC(18,2) := 100000.00; -- Easy to change configuration value
BEGIN
  -- Generate a unique 10-digit account number (1000000000 to 9999999999)
  LOOP
    generated_acc_num := floor(random() * 9000000000 + 1000000000)::text;
    
    -- Check for uniqueness in profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE account_number = generated_acc_num) THEN
      EXIT;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate a unique account number';
    END IF;
  END LOOP;

  -- Create profile
  INSERT INTO public.profiles (id, full_name, email, account_number, created_at, updated_at)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    generated_acc_num,
    now(),
    now()
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance, currency, created_at, updated_at)
  VALUES (
    new.id,
    starting_balance,
    'NGN',
    now(),
    now()
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on auth user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC for Secure Lookup of Recipient (bypassing strict profile RLS)
CREATE OR REPLACE FUNCTION public.lookup_recipient(recipient_account_number VARCHAR(10))
RETURNS TABLE (full_name TEXT, account_number VARCHAR(10)) AS $$
BEGIN
  RETURN QUERY
  SELECT p.full_name, p.account_number
  FROM public.profiles p
  WHERE p.account_number = recipient_account_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for Secure Money Transfer (Transfer Engine)
CREATE OR REPLACE FUNCTION public.transfer_money(
  recipient_account_number VARCHAR(10),
  transfer_amount NUMERIC(18,2),
  transfer_description TEXT
)
RETURNS JSONB AS $$
DECLARE
  sender_uuid UUID;
  recipient_uuid UUID;
  sender_bal NUMERIC(18,2);
  recipient_bal NUMERIC(18,2);
  trx_ref VARCHAR(50);
  result_json JSONB;
BEGIN
  -- 1. Verify the authenticated sender
  sender_uuid := auth.uid();
  IF sender_uuid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 3. Verify the amount is greater than zero
  IF transfer_amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be greater than zero';
  END IF;

  -- 2. Verify the recipient exists
  SELECT id INTO recipient_uuid
  FROM public.profiles
  WHERE account_number = recipient_account_number;

  IF recipient_uuid IS NULL THEN
    RAISE EXCEPTION 'Recipient account not found';
  END IF;

  -- 4. Verify the sender is not transferring to themselves
  IF sender_uuid = recipient_uuid THEN
    RAISE EXCEPTION 'You cannot transfer money to your own account';
  END IF;

  -- 5. & 6. Lock the sender and recipient wallet rows during the transaction to prevent race conditions
  -- We lock rows in a sorted order based on UUID to prevent potential deadlocks
  IF sender_uuid < recipient_uuid THEN
    SELECT balance INTO sender_bal FROM public.wallets WHERE user_id = sender_uuid FOR UPDATE;
    SELECT balance INTO recipient_bal FROM public.wallets WHERE user_id = recipient_uuid FOR UPDATE;
  ELSE
    SELECT balance INTO recipient_bal FROM public.wallets WHERE user_id = recipient_uuid FOR UPDATE;
    SELECT balance INTO sender_bal FROM public.wallets WHERE user_id = sender_uuid FOR UPDATE;
  END IF;

  -- 7. Verify sufficient balance
  IF sender_bal < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 8. Deduct money from sender
  UPDATE public.wallets
  SET balance = balance - transfer_amount, updated_at = now()
  WHERE user_id = sender_uuid;

  -- 9. Add money to recipient
  UPDATE public.wallets
  SET balance = balance + transfer_amount, updated_at = now()
  WHERE user_id = recipient_uuid;

  -- 11. Generate a unique transaction reference (e.g. TRX-20260826-ABC12345)
  trx_ref := 'TRX-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 8));

  -- 10. Create a transaction record
  INSERT INTO public.transactions (
    reference,
    sender_id,
    recipient_id,
    amount,
    currency,
    transaction_type,
    status,
    description,
    created_at
  )
  VALUES (
    trx_ref,
    sender_uuid,
    recipient_uuid,
    transfer_amount,
    'NGN',
    'TRANSFER',
    'SUCCESS',
    transfer_description,
    now()
  );

  result_json := jsonb_build_object(
    'success', true,
    'reference', trx_ref,
    'amount', transfer_amount,
    'recipient_name', (SELECT full_name FROM public.profiles WHERE id = recipient_uuid),
    'recipient_account', recipient_account_number,
    'created_at', now()
  );

  RETURN result_json;
EXCEPTION
  WHEN OTHERS THEN
    -- In PostgreSQL, raising an exception in an RPC naturally aborts and rolls back the transaction
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for fetching transaction history with resolved names
CREATE OR REPLACE FUNCTION public.get_transaction_history()
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
  user_uuid UUID;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
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
  WHERE t.sender_id = user_uuid OR t.recipient_id = user_uuid
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

