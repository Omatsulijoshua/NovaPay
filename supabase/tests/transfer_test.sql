-- NovaPay Transfer Engine Test Script
-- Run this in your Supabase SQL Editor to verify the backend database RPC functions.
-- This script runs inside a transaction block and rolls back at the end to keep your database clean.

BEGIN;

-- 1. Create a mock schema/function for auth.uid() to simulate Alice
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT '11111111-1111-1111-1111-111111111111'::UUID;
$$ LANGUAGE sql STABLE;

-- 2. Clean up any previous conflicting test IDs
DELETE FROM public.transactions WHERE sender_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.wallets WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- 3. Create Sender Profile and Wallet (Alice - Account Number: 1000000001)
INSERT INTO public.profiles (id, full_name, email, account_number)
VALUES ('11111111-1111-1111-1111-111111111111', 'Test Alice', 'alice@test.com', '1000000001');

INSERT INTO public.wallets (user_id, balance, currency)
VALUES ('11111111-1111-1111-1111-111111111111', 10000.00, 'NGN');

-- 4. Create Recipient Profile and Wallet (Bob - Account Number: 2000000002)
INSERT INTO public.profiles (id, full_name, email, account_number)
VALUES ('22222222-2222-2222-2222-222222222222', 'Test Bob', 'bob@test.com', '2000000002');

INSERT INTO public.wallets (user_id, balance, currency)
VALUES ('22222222-2222-2222-2222-222222222222', 5000.00, 'NGN');

-- Output Initial Balances
SELECT 'Initial Balances' AS step, p.full_name, w.balance 
FROM public.profiles p 
JOIN public.wallets w ON p.id = w.user_id 
WHERE p.id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Test Scenario 1: Standard Transfer (Alice -> Bob ₦2,000)
SELECT 'Test Scenario 1: Alice transfers ₦2,000 to Bob' AS scenario;
SELECT public.transfer_money('2000000002', 2000.00, 'Guitar string fund');

-- Verify Balances after Test 1 (Alice should have ₦8,000 and Bob ₦7,000)
SELECT 'Balances after Scenario 1' AS step, p.full_name, w.balance 
FROM public.profiles p 
JOIN public.wallets w ON p.id = w.user_id
WHERE p.id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Test Scenario 2: Self Transfer (Should FAIL with 'You cannot transfer money to your own account')
-- Note: In PG SQL execution, a raised exception terminates the block. To run subsequent checks individually, 
-- you can uncomment them one by one.

-- SELECT 'Test Scenario 2: Alice transfers to herself' AS scenario;
-- SELECT public.transfer_money('1000000001', 1000.00, 'Self transfer');

-- Test Scenario 3: Insufficient Balance (Should FAIL with 'Insufficient balance')
-- SELECT 'Test Scenario 3: Alice transfers ₦50,000 to Bob' AS scenario;
-- SELECT public.transfer_money('2000000002', 50000.00, 'Overdraft transfer');

-- Test Scenario 4: Negative/Zero Amount (Should FAIL with 'Transfer amount must be greater than zero')
-- SELECT 'Test Scenario 4: Alice transfers -₦1,000 to Bob' AS scenario;
-- SELECT public.transfer_money('2000000002', -1000.00, 'Negative transfer');

ROLLBACK;
