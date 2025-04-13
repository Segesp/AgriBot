'use client';

import { useState } from 'react';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  lastUpdate: string;
  trend?: 'up' | 'down' | 'stable' | null;
  status?: 'normal' | 'warning' | 'critical' | null;
  minValue?: number | null;
  maxValue?: number | null;
}

export default function SensorCard({ 
  title, 
  value, 
  unit, 
  icon, 
  color,
  lastUpdate,
  trend = null,
  status = 'normal',
  minValue = null,
  maxValue = null
}: SensorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStatusColor = () => {
    if (status === 'warning') return '#FCD34D';
    if (status === 'critical') return '#EF4444';
    return '#10B981'; // normal
  };
  
  const renderTrendIcon = () => {
    if (!trend) return null;
    
    if (trend === 'up') {
      return (
        <svg 
          className="h-4 w-4 text-red-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    if (trend === 'down') {
      return (
        <svg 
          className="h-4 w-4 text-blue-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    
    if (trend === 'stable') {
      return (
        <svg 
          className="h-4 w-4 text-gray-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      );
    }
  };
  
  const calculatePercentage = () => {
    if (typeof value === 'string' || minValue === null || maxValue === null) {
      return 0;
    }
    
    const numValue = parseFloat(value.toString());
    if (isNaN(numValue)) return 0;
    
    const range = maxValue - minValue;
    if (range <= 0) return 0;
    
    const percentage = ((numValue - minValue) / range) * 100;
    return Math.max(0, Math.min(100, percentage));
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all duration-300 transform ${
        isHovered ? 'scale-105' : ''
      }`} 
      style={{ borderColor: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <div className={`p-2 rounded-full ${isHovered ? 'animate-pulse' : ''}`} style={{ backgroundColor: `${color}22` }}>
              {icon}
            </div>
          </div>
          
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold">{value}</span>
            <span className="ml-1 text-gray-500">{unit}</span>
            {trend && (
              <div className="ml-2 flex items-center">
                {renderTrendIcon()}
              </div>
            )}
          </div>
          
          {minValue !== null && maxValue !== null && (
            <div className="mt-3 mb-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{ 
                    width: `${calculatePercentage()}%`,
                    backgroundColor: getStatusColor() 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{minValue}</span>
                <span>{maxValue}</span>
              </div>
            </div>
          )}
          
          <span className="text-xs text-gray-400 block mt-2">
            Actualizado: {lastUpdate}
          </span>
        </div>
      </div>
      
      {status && status !== 'normal' && (
        <div className={`mt-3 text-xs font-medium rounded-full px-2 py-1 inline-block ${
          status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
          status === 'critical' ? 'bg-red-100 text-red-800' : 
          'bg-green-100 text-green-800'
        }`}>
          {status === 'warning' ? 'Atención requerida' : 
           status === 'critical' ? 'Estado crítico' : 'Normal'}
        </div>
      )}
    </div>
  );
} 