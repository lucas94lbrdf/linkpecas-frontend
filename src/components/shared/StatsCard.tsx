import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delta?: number;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, delta, color = "var(--orange)" }) => {
  return (
    <div className="gls p-5 flex items-start gap-4 animate-fade-up">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-extrabold leading-none tracking-tight">{value}</p>
        <p className="text-[10px] uppercase font-bold tracking-wider opacity-30 mt-2">{label}</p>
      </div>
      {delta !== undefined && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${delta >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {delta >= 0 ? '+' : ''}{delta}%
        </span>
      )}
    </div>
  );
};

export default StatsCard;
