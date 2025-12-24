import { AppState, DaySchedule, TimeBucket, AvailabilityStatus } from '../types';

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

export const loadData = (coupleKey: string): AppState => {
  const raw = localStorage.getItem(`${STORAGE_KEY}_${coupleKey}`);
  if (!raw) return getInitialState();
  return JSON.parse(raw);
};

export const saveData = (coupleKey: string, data: AppState) => {
  localStorage.setItem(`${STORAGE_KEY}_${coupleKey}`, JSON.stringify(data));
};

// Helper to generate next 7 days keys
export const getNext7Days = (): string[] => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
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
