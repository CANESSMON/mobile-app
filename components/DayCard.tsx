import React from 'react';
import { DaySchedule, Role, TimeBucket, AvailabilityStatus } from '../types';
import { BucketSelector } from './BucketSelector';
import { MoodSlider } from './MoodSlider';
import { STATUS_CONFIG, BUCKET_ICONS } from '../constants';
import { Check, X } from 'lucide-react';

interface DayCardProps {
  day: DaySchedule;
  role: Role;
  onUpdate: (updatedDay: DaySchedule) => void;
  isToday: boolean;
  surpriseMode?: boolean;
}

interface ReadOnlyBucketProps {
  bucket: TimeBucket;
  status: AvailabilityStatus;
  mood: number;
  surpriseMode: boolean;
}

const ReadOnlyBucket: React.FC<ReadOnlyBucketProps> = ({ bucket, status, mood, surpriseMode }) => {
  const config = STATUS_CONFIG[status];
  const isSurpriseFriendly = status === AvailabilityStatus.SURPRISE_FRIENDLY || (status === AvailabilityStatus.FREE && mood > 70);
  
  // In surprise mode, dim non-friendly slots
  const opacityClass = surpriseMode && !isSurpriseFriendly ? 'opacity-30 grayscale' : 'opacity-100';
  const borderClass = surpriseMode && isSurpriseFriendly ? 'ring-2 ring-purple-500 scale-105 z-10' : '';

  return (
    <div className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all duration-300 ${config.color} ${opacityClass} ${borderClass}`}>
      <div className="flex items-center justify-between w-full opacity-60">
        {BUCKET_ICONS[bucket]}
      </div>
      <div className="font-semibold text-sm flex items-center gap-1">
        {config.label}
      </div>
      {surpriseMode && isSurpriseFriendly && (
         <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full p-1 shadow-md">
           <Check className="w-3 h-3" />
         </div>
      )}
    </div>
  );
};

export const DayCard: React.FC<DayCardProps> = ({ day, role, onUpdate, isToday, surpriseMode = false }) => {
  const dateObj = new Date(day.date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleBucketChange = (bucket: TimeBucket, status: AvailabilityStatus) => {
    if (role === Role.BOYFRIEND) return; // Read only
    onUpdate({
      ...day,
      buckets: {
        ...day.buckets,
        [bucket]: status,
      },
    });
  };

  const handleMoodChange = (mood: number) => {
    if (role === Role.BOYFRIEND) return; // Read only
    onUpdate({ ...day, mood });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {dayName}
            {isToday && <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full">Today</span>}
          </h3>
          <p className="text-slate-500 text-sm">{dateStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {(Object.keys(day.buckets) as TimeBucket[]).map((bucket) => (
          role === Role.GIRLFRIEND ? (
            <BucketSelector 
              key={bucket}
              bucket={bucket}
              status={day.buckets[bucket]}
              onChange={handleBucketChange}
            />
          ) : (
            <ReadOnlyBucket 
              key={bucket}
              bucket={bucket}
              status={day.buckets[bucket]}
              mood={day.mood}
              surpriseMode={surpriseMode}
            />
          )
        ))}
      </div>

      <MoodSlider value={day.mood} onChange={handleMoodChange} readonly={role === Role.BOYFRIEND} />
    </div>
  );
};