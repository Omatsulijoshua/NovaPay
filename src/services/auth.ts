import { supabase } from '../lib/supabase';

export async function signOut() {
  return await supabase.auth.signOut();
}
