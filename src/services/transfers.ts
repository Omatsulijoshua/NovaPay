import { supabase } from '../lib/supabase';

export interface RecipientLookupResult {
  full_name: string;
  account_number: string;
}

export interface TransferResult {
  success: boolean;
  reference: string;
  amount: number;
  recipient_name: string;
  recipient_account: string;
  created_at: string;
}

export async function lookupRecipient(accountNumber: string): Promise<RecipientLookupResult | null> {
  const { data, error } = await supabase.rpc('lookup_recipient', {
    recipient_account_number: accountNumber,
  });

  if (error) {
    console.error('Error looking up recipient:', error);
    throw error;
  }

  const results = data as RecipientLookupResult[];
  return results && results.length > 0 ? results[0] : null;
}

export async function transferMoney(
  recipientAccountNumber: string,
  amount: number,
  description: string
): Promise<TransferResult> {
  const { data, error } = await supabase.rpc('transfer_money', {
    recipient_account_number: recipientAccountNumber,
    transfer_amount: amount,
    transfer_description: description,
  });

  if (error) {
    console.error('Error executing transfer:', error);
    throw error;
  }

  return data as TransferResult;
}
