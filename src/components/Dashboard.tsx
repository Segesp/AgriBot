'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { SensorCard } from './SensorCard';
import SensorChart from './SensorChart';
import SensorMap from './SensorMap';
import dynamic from 'next/dynamic';
import { 
  TemperatureIcon, 
  TemperatureAlertIcon,
  HumidityIcon, 
  HumidityLowIcon,
  LightIcon, 
  SoilIcon, 
  BatteryIcon, 
  LocationIcon,
  SalinityIcon,
  SalinityHighIcon,
  WaterDropIcon,
  NutrientIcon,
  PHIcon
} from './Icons';

// Cargar el mapa dinámicamente para evitar problemas de SSR
const DynamicMap = dynamic(() => import('./SensorMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md h-96 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  ),
});

// Definición del tipo de datos del sensor
interface SensorData {
  id: number;
  timestamp: Date;
  temperatura: number | null;
  humedad: number | null;
  luz: number | null;
  humedadSuelo: number | null;
  salinidad: number | null;
  latitud: number | null;
  longitud: number | null;
  deviceId: string;
  bateria: number | null;
  createdAt: Date;
  // Campos adicionales opcionales
  ph?: number | null;
  nutrientes?: string | null;
}

// Componente para mostrar estadísticas resumidas
const StatsOverview = ({ data }: { data: SensorData[] }) => {
  if (!data.length) return null;
  
  // Calcular estadísticas
  const getStats = (field: keyof SensorData) => {
    const values = data
      .map(item => item[field] as number)
      .filter((val): val is number => val !== null && !isNaN(val));
    
    if (!values.length) return { avg: 'N/A', min: 'N/A', max: 'N/A' };
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      avg: avg.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1)
    };
  };
  
  const tempStats = getStats('temperatura');
  const soilStats = getStats('humedadSuelo');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Resumen Estadístico (Últimas 24h)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-r border-gray-200 pr-4">
          <div className="flex items-center mb-2">
            <TemperatureIcon />
            <h3 className="ml-2 font-medium">Temperatura del Suelo (°C)</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 block">Mín</span>
              <span className="font-semibold text-blue-600">{tempStats.min}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Prom</span>
              <span className="font-semibold">{tempStats.avg}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Máx</span>
              <span className="font-semibold text-red-600">{tempStats.max}</span>
            </div>
          </div>
        </div>
        
        <div className="pl-4">
          <div className="flex items-center mb-2">
            <SoilIcon />
            <h3 className="ml-2 font-medium">Humedad Suelo (%)</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500 block">Mín</span>
              <span className="font-semibold text-red-600">{soilStats.min}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Prom</span>
              <span className="font-semibold">{soilStats.avg}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Máx</span>
              <span className="font-semibold text-green-600">{soilStats.max}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'stats'>('dashboard');
  const [dateFilter, setDateFilter] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | 'todos'>('todos');
  
  // Funciones auxiliares para las tarjetas de sensores
  
  // Determinar la tendencia basándose en datos históricos
  const getTrend = (data: SensorData[], field: keyof SensorData, higherIsBetter = true): 'up' | 'down' | 'stable' | null => {
    if (data.length < 2) return null;
    
    // Tomar las dos mediciones más recientes para comparar
    const latest = data[0][field] as number;
    const previous = data[1][field] as number;
    
    // Verificar si los valores son numéricos
    if (latest === null || previous === null || isNaN(latest) || isNaN(previous)) {
      return null;
    }
    
    // Calcular la diferencia porcentual
    const difference = latest - previous;
    const percentChange = Math.abs(difference / previous) * 100;
    
    // Si el cambio es menor al 1%, considerarlo estable
    if (percentChange < 1) {
      return 'stable';
    }
    
    // Determinar si el cambio es positivo o negativo según la métrica
    if (difference > 0) {
      return higherIsBetter ? 'up' : 'down';
    } else {
      return higherIsBetter ? 'down' : 'up';
    }
  };
  
  // Determinar el estado del sensor basado en umbrales
  const getSensorStatus = (
    value: number | null, 
    warningThreshold: number, 
    criticalThreshold: number, 
    preferHigher = false,  // true si valores más altos son mejores
    invert = false         // invertir lógica (para baterías por ejemplo)
  ): 'normal' | 'warning' | 'critical' | null => {
    if (value === null || isNaN(value)) return null;
    
    // Si invert es true, invertimos la lógica de comparación
    const normalCompare = invert ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
    
    // Si preferHigher es true, umbrales más altos son mejores
    if (preferHigher) {
      if (normalCompare(value, criticalThreshold)) {
        return 'normal';
      } else if (normalCompare(value, warningThreshold)) {
        return 'warning';
      } else {
        return 'critical';
      }
    } 
    // Si preferHigher es false, umbrales más bajos son mejores
    else {
      if (normalCompare(value, criticalThreshold)) {
        return 'critical';
      } else if (normalCompare(value, warningThreshold)) {
        return 'warning';
      } else {
        return 'normal';
      }
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Agregar query param del dispositivo si está seleccionado
        const endpoint = selectedDevice !== 'todos' 
          ? `/api/datos?deviceId=${selectedDevice}`
          : '/api/datos';
          
        const response = await axios.get(endpoint);
        const sensorData = response.data.data;
        setData(sensorData);
        
        // Guardar la lista de dispositivos disponibles
        if (response.data.devices) {
          setAvailableDevices(response.data.devices);
        }
        
        // Comprobar alertas en los datos más recientes
        checkAlerts(sensorData[0]);
        
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
  }, [selectedDevice]); // Añadir selectedDevice como dependencia
  
  // Comprobar valores anómalos para alertas
  const checkAlerts = (latestData: SensorData | undefined) => {
    if (!latestData) return;
    
    const alerts = [];
    
    if (latestData.temperatura && latestData.temperatura > 30) {
      alerts.push('Temperatura elevada detectada');
    }
    
    if (latestData.humedadSuelo && latestData.humedadSuelo < 20) {
      alerts.push('Humedad del suelo baja - posible necesidad de riego');
    }
    
    if (latestData.salinidad && latestData.salinidad > 4) {
      alerts.push('Nivel de salinidad alto detectado');
    }
    
    if (latestData.bateria && latestData.bateria < 20) {
      alerts.push('Batería baja en dispositivo');
    }
    
    setAlertMessage(alerts.length ? alerts.join(' | ') : null);
  };
  
  // Filtrar datos según el rango de fechas seleccionado
  const getFilteredData = () => {
    if (dateFilter === 'all' || !data.length) return data;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (dateFilter) {
      case '24h':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };
  
  // Obtener datos filtrados
  const filteredData = getFilteredData();
  
  // Obtener el registro más reciente
  const latestData = filteredData.length > 0 ? filteredData[0] : null;
  
  // Formatear datos para los gráficos (últimos 20 registros en orden cronológico)
  const chartData = [...filteredData].reverse().slice(0, 20);
  
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
  const salinityData = chartData.map(d => d.salinidad as number);
  
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado y controles */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Sistema de Monitorización AgriBot</h1>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {/* Selector de dispositivos */}
          {availableDevices.length > 0 && (
            <select 
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos los dispositivos</option>
              {availableDevices.map(device => (
                <option key={device} value={device}>{device}</option>
              ))}
            </select>
          )}
          
          {/* Filtro de fechas */}
          <div className="bg-gray-100 rounded-lg p-1 flex text-sm">
            <button 
              onClick={() => setDateFilter('24h')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === '24h' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              24h
            </button>
            <button 
              onClick={() => setDateFilter('7d')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === '7d' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 días
            </button>
            <button 
              onClick={() => setDateFilter('30d')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === '30d' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              30 días
            </button>
            <button 
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                dateFilter === 'all' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todo
            </button>
          </div>
          
          {/* Tabs de navegación */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stats' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Estadísticas
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mapa
            </button>
          </div>
        </div>
      </div>
      
      {/* Mostrar alertas si existen */}
      {alertMessage && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md shadow-sm" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Alerta del sistema</p>
              <p className="text-sm">{alertMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Última actualización (móvil) */}
      <div className="text-sm text-gray-500">
        Última actualización: {lastUpdate}
      </div>
      
      {/* Vista principal del dashboard */}
      {activeTab === 'dashboard' && latestData && (
        <>
          <StatsOverview data={filteredData} />
          
          {/* Tarjetas de datos actuales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SensorCard
              title="Temperatura del Suelo"
              value={latestData.temperatura?.toFixed(1) ?? 'N/A'}
              unit="°C"
              icon={latestData.temperatura && latestData.temperatura > 30 ? 
                <TemperatureAlertIcon size="h-10 w-10" /> : 
                <TemperatureIcon size="h-10 w-10" withPulse={latestData.temperatura ? latestData.temperatura > 28 : false} />
              }
              color="#EF4444"
              lastUpdate={lastUpdate}
              isAlert={latestData.temperatura ? latestData.temperatura > 30 : false}
            />
            
            <SensorCard
              title="Humedad del Suelo"
              value={latestData.humedadSuelo?.toFixed(1) ?? 'N/A'}
              unit="%"
              icon={latestData.humedadSuelo && latestData.humedadSuelo < 20 ? 
                <HumidityLowIcon size="h-10 w-10" /> : 
                <SoilIcon size="h-10 w-10" withPulse={latestData.humedadSuelo ? latestData.humedadSuelo < 25 : false} />
              }
              color="#10B981"
              lastUpdate={lastUpdate}
              isAlert={latestData.humedadSuelo ? latestData.humedadSuelo < 20 : false}
            />
            
            <SensorCard
              title="Salinidad del Suelo"
              value={latestData.salinidad?.toFixed(2) ?? 'N/A'}
              unit="dS/m"
              icon={latestData.salinidad && latestData.salinidad > 4 ? 
                <SalinityHighIcon size="h-10 w-10" /> : 
                <SalinityIcon size="h-10 w-10" withPulse={latestData.salinidad ? latestData.salinidad > 3 : false} />
              }
              color={latestData.salinidad && latestData.salinidad > 4 ? "#EF4444" : "#0D9488"}
              lastUpdate={lastUpdate}
              isAlert={latestData.salinidad ? latestData.salinidad > 4 : false}
            />
            
            <SensorCard
              title="Batería"
              value={latestData.bateria?.toFixed(1) ?? 'N/A'}
              unit="%"
              icon={<BatteryIcon 
                size="h-10 w-10" 
                level={latestData.bateria ?? 100}
              />}
              color={latestData.bateria && latestData.bateria <= 20 ? "#EF4444" : "#10B981"}
              lastUpdate={lastUpdate}
              isAlert={latestData.bateria ? latestData.bateria <= 20 : false}
            />

            {latestData.ph !== undefined && (
              <SensorCard
                title="pH del Suelo"
                value={(latestData.ph ?? 7).toFixed(1)}
                unit="pH"
                icon={<PHIcon size="h-10 w-10" withPulse={latestData.ph ? (latestData.ph < 5.5 || latestData.ph > 8) : false} />}
                color={
                  latestData.ph && latestData.ph < 5.5 ? "#EF4444" :
                  latestData.ph && latestData.ph > 8 ? "#F59E0B" : 
                  "#10B981"
                }
                lastUpdate={lastUpdate}
                isAlert={latestData.ph ? (latestData.ph < 5.5 || latestData.ph > 8) : false}
              />
            )}

            {latestData.nutrientes !== undefined && (
              <SensorCard
                title="Nutrientes Disponibles"
                value={(latestData.nutrientes ?? "Med").toString()}
                unit=""
                icon={<NutrientIcon size="h-10 w-10" withPulse={latestData.nutrientes === "Bajo"} />}
                color={
                  latestData.nutrientes === "Bajo" ? "#EF4444" :
                  latestData.nutrientes === "Alto" ? "#10B981" : 
                  "#F59E0B"
                }
                lastUpdate={lastUpdate}
                isAlert={latestData.nutrientes === "Bajo"}
              />
            )}
          </div>
          
          {/* Gráficos históricos */}
          {chartData.length > 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Tendencias Históricas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SensorChart
                  title="Temperatura del Suelo"
                  data={temperatureData}
                  labels={timeLabels}
                  color="#EF4444"
                  unit="°C"
                  targetValue={23}
                />
                
                <SensorChart
                  title="Humedad del Suelo"
                  data={soilData}
                  labels={timeLabels}
                  color="#10B981"
                  unit="%"
                  targetValue={50}
                />
                
                <SensorChart
                  title="Salinidad del Suelo"
                  data={salinityData}
                  labels={timeLabels}
                  color="#0D9488"
                  unit="dS/m"
                />
                
                <SensorChart
                  title="Batería"
                  data={filteredData.map(d => d.bateria as number)}
                  labels={timeLabels}
                  color="#6B7280"
                  unit="%"
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Vista de estadísticas */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <StatsOverview data={filteredData} />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Análisis Detallado</h2>
            
            <div className="space-y-8">
              {/* Temperatura */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                  <div className={`h-8 w-8 ${
                    latestData && latestData.temperatura && latestData.temperatura > 30
                      ? 'animate-pulse'
                      : ''
                  }`}>
                    {latestData && latestData.temperatura && latestData.temperatura > 30 ? 
                      <TemperatureAlertIcon size="h-8 w-8" /> : 
                      <TemperatureIcon size="h-8 w-8" />
                    }
                  </div>
                  <span className="ml-2">Análisis de Temperatura del Suelo</span>
                </h3>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: latestData && latestData.temperatura 
                        ? `${Math.min(100, (latestData.temperatura / 40) * 100)}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0°C</span>
                  <span>10°C</span>
                  <span>20°C</span>
                  <span>30°C</span>
                  <span>40°C+</span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Temperatura Óptima</h4>
                    <p className="font-medium">18°C - 26°C</p>
                    <p className="text-xs text-gray-500 mt-2">Rango ideal para la mayoría de cultivos</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Estado Actual</h4>
                    <p className={`font-medium ${
                      latestData && latestData.temperatura
                        ? latestData.temperatura > 30 
                          ? 'text-red-600' 
                          : latestData.temperatura < 15 
                            ? 'text-blue-600' 
                            : 'text-green-600'
                        : ''
                    }`}>
                      {latestData && latestData.temperatura
                        ? latestData.temperatura > 30 
                          ? 'Temperatura alta' 
                          : latestData.temperatura < 15 
                            ? 'Temperatura baja' 
                            : 'Óptima'
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {latestData?.temperatura?.toFixed(1) ?? 'N/A'}°C registrados
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Recomendación</h4>
                    <p className="font-medium">
                      {latestData && latestData.temperatura
                        ? latestData.temperatura > 30 
                          ? 'Proporcionar sombra y riego' 
                          : latestData.temperatura < 15 
                            ? 'Evaluar protección térmica' 
                            : 'Mantener condiciones actuales'
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Humedad del Suelo */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                  <div className={`h-8 w-8 ${
                    latestData && latestData.humedadSuelo && latestData.humedadSuelo < 20
                      ? 'animate-pulse'
                      : ''
                  }`}>
                    {latestData && latestData.humedadSuelo && latestData.humedadSuelo < 20 ? 
                      <HumidityLowIcon size="h-8 w-8" /> : 
                      <SoilIcon size="h-8 w-8" />
                    }
                  </div>
                  <span className="ml-2">Análisis de Humedad del Suelo</span>
                </h3>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                      latestData && latestData.humedadSuelo
                        ? latestData.humedadSuelo < 20 
                          ? 'bg-red-500' 
                          : latestData.humedadSuelo > 80 
                            ? 'bg-blue-600' 
                            : 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    style={{ 
                      width: latestData && latestData.humedadSuelo 
                        ? `${Math.min(100, latestData.humedadSuelo)}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Interpretación</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-xs">Bajo (&lt;20%): Necesita riego urgente</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-xs">Moderado (20-40%): Programar riego pronto</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs">Óptimo (40-70%): Humedad adecuada</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-xs">Saturado (&gt;70%): Riesgo de encharcamiento</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Recomendación</h4>
                    <p className="font-medium">
                      {latestData && latestData.humedadSuelo
                        ? latestData.humedadSuelo < 20 
                          ? 'Riego necesario inmediatamente' 
                          : latestData.humedadSuelo > 80 
                            ? 'Evitar riego adicional, riesgo de sobresaturación' 
                            : 'Mantener régimen de riego actual'
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      La humedad actual es {latestData?.humedadSuelo?.toFixed(1) ?? 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Salinidad del Suelo */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                  <div className={`h-8 w-8 ${
                    latestData && latestData.salinidad && latestData.salinidad > 4
                      ? 'animate-pulse'
                      : ''
                  }`}>
                    {latestData && latestData.salinidad && latestData.salinidad > 4 ? 
                      <SalinityHighIcon size="h-8 w-8" /> : 
                      <SalinityIcon size="h-8 w-8" />
                    }
                  </div>
                  <span className="ml-2">Análisis de Salinidad del Suelo</span>
                </h3>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ 
                      width: latestData && latestData.salinidad 
                        ? `${Math.min(100, (latestData.salinidad / 8) * 100)}%` 
                        : '0%',
                      background: latestData && latestData.salinidad
                        ? latestData.salinidad < 2
                          ? '#10b981' // Verde
                          : latestData.salinidad < 4
                            ? '#f59e0b' // Amarillo
                            : '#ef4444' // Rojo
                        : '#9ca3af'
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0 dS/m</span>
                  <span>2 dS/m</span>
                  <span>4 dS/m</span>
                  <span>6 dS/m</span>
                  <span>8+ dS/m</span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Interpretación</h4>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs">Óptimo (&lt;2 dS/m): Adecuado para cultivos</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-xs">Moderado (2-4 dS/m): Vigilar desarrollo</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-xs">Alto (4-6 dS/m): Afecta algunos cultivos</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-xs">Severo (&gt;6 dS/m): Riesgo para la mayoría de cultivos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Recomendación</h4>
                    <p className="font-medium">
                      {latestData && latestData.salinidad
                        ? latestData.salinidad > 4 
                          ? 'Aumento de riego para lixiviación de sales' 
                          : latestData.salinidad > 2 
                            ? 'Monitoreo frecuente y selección de cultivos tolerantes' 
                            : 'Niveles adecuados, mantener manejo actual'
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      La salinidad actual es {latestData?.salinidad?.toFixed(2) ?? 'N/A'} dS/m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Vista del mapa */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribución Geográfica de Sensores</h2>
            <DynamicMap data={filteredData} />
          </div>
        </div>
      )}
    </div>
  );
} 