'use client';

import React from 'react';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  lastUpdate?: string;
  isAlert?: boolean;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  lastUpdate,
  isAlert = false
}) => {
  return (
    <div 
      className={`
        relative rounded-xl p-4 shadow-md backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isAlert 
          ? 'bg-red-500/10 border border-red-500/50 animate-pulse'
          : 'bg-white/10 hover:bg-white/20 border border-white/20'
        }
      `}
    >
      {isAlert && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-ping"></div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <div className="flex items-end mt-1">
            <div className="text-2xl font-bold" style={{ color }}>
              {value}
            </div>
            <div className="text-xs text-gray-400 ml-1 mb-1">{unit}</div>
          </div>
        </div>
        
        <div className={`p-1 rounded-lg ${isAlert ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
      </div>

      {lastUpdate && (
        <div className="text-xs text-gray-400 mt-3">
          Ultima actualización: {lastUpdate}
        </div>
      )}
    </div>
  );
}; 