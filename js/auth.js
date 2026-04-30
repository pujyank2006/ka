// js/auth.js
import { supabaseClient } from './config.js';

// Cache user data to avoid excessive API calls
let cachedUser = null;
let cachedProfile = null;
let cacheExpiry = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function getUser() {
  const now = Date.now();
  if (cachedUser && now < cacheExpiry) {
    return cachedUser;
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error('Auth error:', error);
      return null;
    }

    cachedUser = user;
    cacheExpiry = now + CACHE_DURATION;
    return user;
  } catch (err) {
    console.error('Failed to get user:', err);
    return null;
  }
}

export async function getUserProfile(userId) {
  if (cachedProfile && cachedProfile.id === userId && Date.now() < cacheExpiry) {
    return cachedProfile;
  }

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    cachedProfile = data;
    return data;
  } catch (err) {
    console.error('Failed to get profile:', err);
    return null;
  }
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
  // Clear cache on sign out
  cachedUser = null;
  cachedProfile = null;
  cacheExpiry = 0;

  await supabaseClient.auth.signOut();
  window.location.href = '/index.html';
}
