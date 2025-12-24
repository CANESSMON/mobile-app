import { AvailabilityStatus, TimeBucket } from './types';
import { Briefcase, BatteryLow, Coffee, PartyPopper, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import React from 'react';

export const TIME_BUCKETS = [
  TimeBucket.MORNING,
  TimeBucket.AFTERNOON,
  TimeBucket.EVENING,
  TimeBucket.NIGHT,
];

export const STATUS_CONFIG = {
  [AvailabilityStatus.BUSY]: {
    label: 'Busy',
    color: 'bg-red-50 border-red-200 text-red-700',
    activeColor: 'bg-red-500 text-white shadow-red-200',
    icon: <Briefcase className="w-4 h-4" />,
    desc: 'Not available'
  },
  [AvailabilityStatus.LOW_ENERGY]: {
    label: 'Low Battery',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    activeColor: 'bg-orange-400 text-white shadow-orange-200',
    icon: <BatteryLow className="w-4 h-4" />,
    desc: 'Free but tired'
  },
  [AvailabilityStatus.FREE]: {
    label: 'Free',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-500 text-white shadow-emerald-200',
    icon: <Coffee className="w-4 h-4" />,
    desc: 'Open to plans'
  },
  [AvailabilityStatus.SURPRISE_FRIENDLY]: {
    label: 'Surprise Me',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    activeColor: 'bg-violet-500 text-white shadow-violet-200',
    icon: <PartyPopper className="w-4 h-4" />,
    desc: 'Ideal for surprises'
  },
};

export const BUCKET_ICONS = {
  [TimeBucket.MORNING]: <Sunrise className="w-4 h-4" />,
  [TimeBucket.AFTERNOON]: <Sun className="w-4 h-4" />,
  [TimeBucket.EVENING]: <Sunset className="w-4 h-4" />,
  [TimeBucket.NIGHT]: <Moon className="w-4 h-4" />,
};

export const APP_NAME = "SyncHearts";
