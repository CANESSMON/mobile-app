import { AppState, DaySchedule, TimeBucket, AvailabilityStatus } from '../types';
import { getClient } from './supabase';

const STORAGE_KEY = 'synchearts_data_v1';
const SESSION_KEY = 'synchearts_session_v1';

const getInitialState = (): AppState => ({
  schedules: {},
});

export const saveSession = (role: string, coupleKey: string) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role, coupleKey }));
};

export const getSession = () => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- DATA FETCHING (Async) ---

export const loadData = async (coupleKey: string): Promise<AppState> => {
  const supabase = getClient();
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('data')
        .eq('couple_key', coupleKey)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found", which is fine
        console.error("Supabase load error:", error);
      }

      if (data && data.data) {
        // Cache it locally too
        localStorage.setItem(`${STORAGE_KEY}_${coupleKey}`, JSON.stringify(data.data));
        return data.data as AppState;
      }
    } catch (e) {
      console.error("Failed to load from Supabase", e);
    }
  }

  // Fallback to LocalStorage
  const raw = localStorage.getItem(`${STORAGE_KEY}_${coupleKey}`);
  if (!raw) return getInitialState();
  return JSON.parse(raw);
};

export const saveData = async (coupleKey: string, data: AppState) => {
  // 1. Save Locally
  localStorage.setItem(`${STORAGE_KEY}_${coupleKey}`, JSON.stringify(data));

  // 2. Save to Cloud if configured
  const supabase = getClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('schedules')
        .upsert({ couple_key: coupleKey, data: data }, { onConflict: 'couple_key' });
      
      if (error) console.error("Supabase save error:", error);
    } catch (e) {
      console.error("Failed to save to Supabase", e);
    }
  }
};

export const subscribeToChanges = (coupleKey: string, onUpdate: (newData: AppState) => void) => {
  const supabase = getClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`public:schedules:${coupleKey}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'schedules',
        filter: `couple_key=eq.${coupleKey}`,
      },
      (payload) => {
        if (payload.new && payload.new.data) {
          onUpdate(payload.new.data as AppState);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Helper to generate next 18 days keys
export const getUpcomingDays = (): string[] => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 18; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const getEmptySchedule = (date: string): DaySchedule => ({
  date,
  mood: 50,
  buckets: {
    [TimeBucket.MORNING]: AvailabilityStatus.BUSY,
    [TimeBucket.AFTERNOON]: AvailabilityStatus.BUSY,
    [TimeBucket.EVENING]: AvailabilityStatus.FREE,
    [TimeBucket.NIGHT]: AvailabilityStatus.FREE,
  },
});