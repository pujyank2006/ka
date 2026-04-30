// js/auth.js
import { supabaseClient } from './config.js';

export async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

export async function getUserProfile(userId) {
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  const profile = await getUserProfile(user.id);
  if (profile?.role !== 'admin') {
    window.location.href = '/index.html';
    return null;
  }
  return { user, profile };
}

export async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = '/index.html';
}
