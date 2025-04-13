'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import SensorCard from './SensorCard';
import SensorChart from './SensorChart';
import { TemperatureIcon, HumidityIcon, LightIcon, SoilIcon, BatteryIcon, LocationIcon } from './Icons';

// Definición del tipo de datos del sensor
interface SensorData {
  id: number;
  timestamp: Date;
  temperatura: number | null;
  humedad: number | null;
  luz: number | null;
  humedadSuelo: number | null;
  latitud: number | null;
  longitud: number | null;
  deviceId: string;
  bateria: number | null;
  createdAt: Date;
}

export default function Dashboard() {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/datos');
        setData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Actualización periódica cada 1 minuto
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Obtener el registro más reciente
  const latestData = data.length > 0 ? data[0] : null;
  
  // Formatear datos para los gráficos (últimos 20 registros en orden cronológico)
  const chartData = [...data].reverse().slice(0, 20);
  
  // Formatear fechas para las etiquetas de los gráficos
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Obtener valores para cada tipo de sensor
  const temperatureData = chartData.map(d => d.temperatura as number);
  const humidityData = chartData.map(d => d.humedad as number);
  const lightData = chartData.map(d => d.luz as number);
  const soilData = chartData.map(d => d.humedadSuelo as number);
  
  // Etiquetas de tiempo para todos los gráficos
  const timeLabels = chartData.map(d => formatDate(d.timestamp));
  
  // Formatear último tiempo de actualización
  const lastUpdate = latestData 
    ? new Date(latestData.timestamp).toLocaleString('es-ES')
    : 'N/A';
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Título del dashboard */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard del Sistema IoT</h1>
        <span className="text-sm text-gray-500">
          Última actualización: {lastUpdate}
        </span>
      </div>
      
      {/* Cards para datos actuales */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SensorCard
            title="Temperatura"
            value={latestData.temperatura?.toFixed(1) ?? 'N/A'}
            unit="°C"
            icon={<TemperatureIcon />}
            color="#EF4444"
            lastUpdate={lastUpdate}
          />
          
          <SensorCard
            title="Humedad"
            value={latestData.humedad?.toFixed(1) ?? 'N/A'}
            unit="%"
            icon={<HumidityIcon />}
            color="#3B82F6"
            lastUpdate={lastUpdate}
          />
          
          <SensorCard
            title="Luz"
            value={latestData.luz?.toFixed(0) ?? 'N/A'}
            unit="lux"
            icon={<LightIcon />}
            color="#F59E0B"
            lastUpdate={lastUpdate}
          />
          
          <SensorCard
            title="Humedad del Suelo"
            value={latestData.humedadSuelo?.toFixed(1) ?? 'N/A'}
            unit="%"
            icon={<SoilIcon />}
            color="#10B981"
            lastUpdate={lastUpdate}
          />
          
          <SensorCard
            title="Batería"
            value={latestData.bateria?.toFixed(1) ?? 'N/A'}
            unit="%"
            icon={<BatteryIcon />}
            color="#6B7280"
            lastUpdate={lastUpdate}
          />
          
          {latestData.latitud && latestData.longitud && (
            <SensorCard
              title="Ubicación"
              value={`${latestData.latitud.toFixed(5)}, ${latestData.longitud.toFixed(5)}`}
              unit=""
              icon={<LocationIcon />}
              color="#8B5CF6"
              lastUpdate={lastUpdate}
            />
          )}
        </div>
      )}
      
      {/* Gráficos */}
      {chartData.length > 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Gráficos Históricos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SensorChart
              title="Temperatura"
              data={temperatureData}
              labels={timeLabels}
              color="#EF4444"
              unit="°C"
            />
            
            <SensorChart
              title="Humedad"
              data={humidityData}
              labels={timeLabels}
              color="#3B82F6"
              unit="%"
            />
            
            <SensorChart
              title="Luz"
              data={lightData}
              labels={timeLabels}
              color="#F59E0B"
              unit="lux"
            />
            
            <SensorChart
              title="Humedad del Suelo"
              data={soilData}
              labels={timeLabels}
              color="#10B981"
              unit="%"
            />
          </div>
        </div>
      )}
      
      {/* Sin datos */}
      {data.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No hay datos disponibles. Por favor, espere a que el dispositivo envíe información.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 