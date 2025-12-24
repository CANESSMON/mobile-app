import React from 'react';
import { Frown, Meh, Smile, Heart } from 'lucide-react';

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
}

export const MoodSlider: React.FC<MoodSliderProps> = ({ value, onChange, readonly = false }) => {
  const getIcon = () => {
    if (value < 25) return <Frown className="w-6 h-6 text-red-500" />;
    if (value < 50) return <Meh className="w-6 h-6 text-orange-500" />;
    if (value < 75) return <Smile className="w-6 h-6 text-green-500" />;
    return <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />;
  };

  const getLabel = () => {
    if (value < 25) return "Rough day";
    if (value < 50) return "Okay";
    if (value < 75) return "Good";
    return "Feeling loved";
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Daily Mood</span>
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold text-slate-800">{getLabel()}</span>
           {getIcon()}
        </div>
      </div>
      
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        disabled={readonly}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900 ${readonly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </div>
  );
};