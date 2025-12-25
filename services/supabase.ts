import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'synchearts_supabase_config';

// Hardcoded defaults
const DEFAULT_URL = "https://fdxwtghacaxkmfojcayt.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeHd0Z2hhY2F4a21mb2pjYXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzQ0MDEsImV4cCI6MjA4MjI1MDQwMX0.eHYv7YTafi2HlX51Wq599-_uTu2wABTPs_1VR3h3K1Q";

export interface SupabaseConfig {
  url: string;
  key: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  // 1. Check LocalStorage (User override from the Login UI)
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // 2. Return Hardcoded Defaults
  return { url: DEFAULT_URL, key: DEFAULT_KEY };
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
}

export const getClient = () => {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key);
};