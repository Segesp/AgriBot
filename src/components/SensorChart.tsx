'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler
} from 'chart.js';

// Registramos los componentes necesarios para ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Tipos extendidos para trabajar con las propiedades adicionales
interface ExtendedDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
  borderDash?: number[];
}

interface SensorChartProps {
  title: string;
  data: number[];
  labels: string[];
  color: string;
  unit: string;
  showStats?: boolean;
  targetValue?: number | null;
}

export default function SensorChart({ 
  title, 
  data, 
  labels, 
  color, 
  unit,
  showStats = true,
  targetValue = null
}: SensorChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showAverage, setShowAverage] = useState<boolean>(true);
  
  // Calcular estadísticas
  const validData = data.filter(val => val !== null && !isNaN(val));
  const average = validData.length 
    ? validData.reduce((acc, val) => acc + val, 0) / validData.length 
    : 0;
  const min = validData.length ? Math.min(...validData) : 0;
  const max = validData.length ? Math.max(...validData) : 0;
  
  // Configurar datasets
  const datasets: ExtendedDataset[] = [
    {
      label: title,
      data: data,
      borderColor: color,
      backgroundColor: `${color}33`, // Color con transparencia para el área
      fill: chartType === 'area', // Solo llenar si es tipo área
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
    }
  ];
  
  // Añadir línea de promedio si está habilitada
  if (showAverage && validData.length) {
    datasets.push({
      label: 'Promedio',
      data: Array(data.length).fill(average),
      borderColor: '#9CA3AF',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
      borderDash: [5, 5]
    });
  }
  
  // Añadir línea de valor objetivo si se proporciona
  if (targetValue !== null) {
    datasets.push({
      label: 'Objetivo',
      data: Array(data.length).fill(targetValue),
      borderColor: '#10B981',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
      borderDash: [3, 3]
    });
  }
  
  const chartData = {
    labels,
    datasets,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: `${title} (${unit})`,
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: {
          bottom: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y !== null ? context.parsed.y : 'Sin datos';
            return `${datasetLabel}: ${value} ${unit}`;
          }
        },
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        cornerRadius: 5,
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: unit
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Opciones de visualización */}
      <div className="flex justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setChartType('line')}
            className={`px-2 py-1 text-xs rounded ${
              chartType === 'line' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Línea
          </button>
          <button 
            onClick={() => setChartType('area')}
            className={`px-2 py-1 text-xs rounded ${
              chartType === 'area' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Área
          </button>
        </div>
        
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showAverage} 
              onChange={() => setShowAverage(!showAverage)} 
              className="sr-only peer"
            />
            <div className="relative w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-blue-200 peer-focus:outline-none">
              <div className={`absolute w-3 h-3 rounded-full transition-all ${
                showAverage ? 'left-4 bg-blue-600' : 'left-1 bg-gray-400'
              }`}></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">Promedio</span>
          </label>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="w-full h-60">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Estadísticas */}
      {showStats && validData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-xs text-gray-500">Min</span>
            <p className="font-semibold text-sm text-blue-600">{min.toFixed(1)} {unit}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Prom</span>
            <p className="font-semibold text-sm">{average.toFixed(1)} {unit}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Max</span>
            <p className="font-semibold text-sm text-red-600">{max.toFixed(1)} {unit}</p>
          </div>
        </div>
      )}
    </div>
  );
} 