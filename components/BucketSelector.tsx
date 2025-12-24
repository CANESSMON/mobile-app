import React from 'react';
import { AvailabilityStatus, TimeBucket } from '../types';
import { STATUS_CONFIG, BUCKET_ICONS } from '../constants';

interface BucketSelectorProps {
  bucket: TimeBucket;
  status: AvailabilityStatus;
  onChange: (bucket: TimeBucket, status: AvailabilityStatus) => void;
}

export const BucketSelector: React.FC<BucketSelectorProps> = ({ bucket, status, onChange }) => {
  const currentConfig = STATUS_CONFIG[status];

  // Cycle through statuses on click
  const handleCycle = () => {
    const statuses = Object.values(AvailabilityStatus);
    const currentIndex = statuses.indexOf(status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onChange(bucket, nextStatus);
  };

  return (
    <button 
      onClick={handleCycle}
      className={`relative w-full p-3 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group ${currentConfig.activeColor} shadow-md`}
    >
      <div className="absolute top-2 left-2 opacity-50">
        {BUCKET_ICONS[bucket]}
      </div>
      <div className="mt-4 text-2xl">
        {currentConfig.icon}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide">
        {bucket}
      </div>
      <div className="text-[10px] opacity-90 font-medium">
        {currentConfig.label}
      </div>
    </button>
  );
};