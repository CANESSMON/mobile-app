export enum Role {
  GIRLFRIEND = 'GIRLFRIEND',
  BOYFRIEND = 'BOYFRIEND',
}

export enum TimeBucket {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night',
}

export enum AvailabilityStatus {
  BUSY = 'BUSY',
  LOW_ENERGY = 'LOW_ENERGY',
  FREE = 'FREE',
  SURPRISE_FRIENDLY = 'SURPRISE_FRIENDLY',
}

export interface DaySchedule {
  date: string; // ISO Date string YYYY-MM-DD
  buckets: Record<TimeBucket, AvailabilityStatus>;
  mood: number; // 0-100
}

export interface UserSession {
  role: Role;
  coupleKey: string;
}

export interface AppState {
  schedules: Record<string, DaySchedule>; // Keyed by date string
}