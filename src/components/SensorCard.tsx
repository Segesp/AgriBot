'use client';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  lastUpdate: string;
}

export default function SensorCard({ 
  title, 
  value, 
  unit, 
  icon, 
  color,
  lastUpdate 
}: SensorCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4`} style={{ borderColor: color }}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold">{value}</span>
            <span className="ml-1 text-gray-500">{unit}</span>
          </div>
          <span className="text-xs text-gray-400">
            Actualizado: {lastUpdate}
          </span>
        </div>
        <div className={`p-2 rounded-full`} style={{ backgroundColor: `${color}22` }}>
          {icon}
        </div>
      </div>
    </div>
  );
} 