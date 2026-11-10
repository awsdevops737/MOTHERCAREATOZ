import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

export const signUp = (name, email, password) =>
  supabase.auth.signUp({ email, password, options: { data: { name } } });
export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { id: user.id, email: user.email, name: data?.name, role: data?.role || 'customer' };
}

export const sendOtp = (email) => supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
export const verifyOtp = (email, token) => supabase.auth.verifyOtp({ email, token, type: 'email' });
export const resetPassword = (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
export const updatePassword = (password) => supabase.auth.updateUser({ password });
