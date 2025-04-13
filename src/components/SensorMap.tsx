'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import { scaleLinear } from 'd3-scale';

// Define la interfaz para los datos georreferenciados
export interface GeoData {
  id: number;
  timestamp: Date;
  temperatura: number | null;
  humedad: number | null;
  luz: number | null;
  humedadSuelo: number | null;
  salinidad: number | null;
  latitud: number;  // Requerido para el mapa
  longitud: number; // Requerido para el mapa
  deviceId: string;
  bateria: number | null;
  createdAt: Date;
}

// Filtra solo los datos con coordenadas válidas
const filterValidCoordinates = (data: any[]): GeoData[] => {
  return data.filter(
    (item) => 
      item.latitud !== null && 
      item.longitud !== null && 
      !isNaN(item.latitud) && 
      !isNaN(item.longitud) &&
      Math.abs(item.latitud) <= 90 &&
      Math.abs(item.longitud) <= 180
  ) as GeoData[];
};

// Extender los tipos de Leaflet para corregir errores
interface MarkerOptions extends L.CircleMarkerOptions {
  radius: number;
}

// Opciones para el marcador del mapa
const getMarkerOptions = (salinidad: number | null): MarkerOptions => {
  if (salinidad === null) return { color: '#777', fillColor: '#999', radius: 8 };
  
  // Escala de colores basada en niveles de salinidad
  const colorScale = scaleLinear<string>()
    .domain([0, 2, 4, 8])
    .range(['#4ade80', '#facc15', '#f97316', '#ef4444'])
    .clamp(true);
  
  return {
    color: '#333',
    weight: 1,
    fillColor: colorScale(salinidad),
    fillOpacity: 0.8,
    radius: 8 + Math.min(salinidad, 8) * 0.5, // Radio proporcional al nivel de salinidad
  };
};

// Definir tipo personalizado para la leyenda
class LegendControl extends L.Control {
  onAdd(map: L.Map): HTMLElement {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2)">
        <h4 style="margin: 0 0 8px; font-size: 14px">Nivel de Salinidad (dS/m)</h4>
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <div style="width: 15px; height: 15px; border-radius: 50%; background: #4ade80; margin-right: 5px"></div>
          <span>&lt; 2 (Óptimo)</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <div style="width: 15px; height: 15px; border-radius: 50%; background: #facc15; margin-right: 5px"></div>
          <span>2 - 4 (Moderado)</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px">
          <div style="width: 15px; height: 15px; border-radius: 50%; background: #f97316; margin-right: 5px"></div>
          <span>4 - 8 (Alto)</span>
        </div>
        <div style="display: flex; align-items: center">
          <div style="width: 15px; height: 15px; border-radius: 50%; background: #ef4444; margin-right: 5px"></div>
          <span>&gt; 8 (Severo)</span>
        </div>
      </div>
    `;
    return div;
  }
}

// Componente principal del mapa
export default function SensorMap({ data }: { data: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  // Inicializar y actualizar el mapa cuando cambian los datos
  useEffect(() => {
    // Si no hay datos o no existe el contenedor, salir
    if (!mapRef.current) return;
    
    // Filtrar solo datos válidos para el mapa
    const validData = filterValidCoordinates(data);
    
    if (validData.length === 0) {
      // Si no hay datos válidos, mostrar mapa en posición por defecto
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([40.416775, -3.703790], 5); // Centro en España
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMap.current);
      }
      return;
    }
    
    // Crear el mapa si no existe
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current);
      
      // Añadir capa base de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
    }
    
    // Limpiar marcadores existentes
    leafletMap.current.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        leafletMap.current?.removeLayer(layer);
      }
    });
    
    // Coordenadas para ajustar la vista
    const latitudes = validData.map(d => d.latitud);
    const longitudes = validData.map(d => d.longitud);
    
    // Calcular centro y extensión del mapa
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    // Añadir marcadores y popup para cada punto
    validData.forEach((point) => {
      const circle = L.circleMarker(
        [point.latitud, point.longitud], 
        getMarkerOptions(point.salinidad)
      ).addTo(leafletMap.current as L.Map);
      
      // Contenido del popup
      const date = new Date(point.timestamp).toLocaleString('es-ES');
      const popupContent = `
        <div style="min-width: 200px">
          <h3 style="margin: 0 0 8px; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px">
            ${point.deviceId} | ${date}
          </h3>
          <table style="width: 100%; border-collapse: collapse">
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Salinidad:</td>
              <td style="padding: 3px 5px">${point.salinidad !== null ? `${point.salinidad.toFixed(2)} dS/m` : 'N/D'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Humedad:</td>
              <td style="padding: 3px 5px">${point.humedadSuelo !== null ? `${point.humedadSuelo.toFixed(1)}%` : 'N/D'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Temperatura:</td>
              <td style="padding: 3px 5px">${point.temperatura !== null ? `${point.temperatura.toFixed(1)}°C` : 'N/D'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Coordenadas:</td>
              <td style="padding: 3px 5px">${point.latitud.toFixed(5)}, ${point.longitud.toFixed(5)}</td>
            </tr>
          </table>
        </div>
      `;
      
      circle.bindPopup(popupContent);
    });
    
    // Ajustar la vista del mapa para mostrar todos los puntos
    if (validData.length === 1) {
      // Si solo hay un punto, centrar en él con zoom fijo
      leafletMap.current.setView([validData[0].latitud, validData[0].longitud], 13);
    } else if (validData.length > 1) {
      // Si hay múltiples puntos, ajustar a sus límites con margen
      leafletMap.current.fitBounds([
        [minLat - 0.05, minLng - 0.05],
        [maxLat + 0.05, maxLng + 0.05]
      ]);
    }
    
    // Añadir leyenda para niveles de salinidad
    if (document.querySelector('.legend')) {
      document.querySelector('.legend')?.remove();
    }
    
    // Usar la clase personalizada para evitar errores de TypeScript
    const legend = new LegendControl({ position: 'bottomright' });
    legend.addTo(leafletMap.current);
    
    // Asegurar que el mapa se renderice correctamente
    leafletMap.current.invalidateSize();
    
  }, [data]);
  
  // Asegurar que el mapa se renderice correctamente al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white">
      <div ref={mapRef} className="h-96 w-full"></div>
      
      {/* Mensaje para datos insuficientes */}
      {filterValidCoordinates(data).length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md z-[1000] text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Sin datos georreferenciados</h3>
          <p className="text-gray-600">No hay lecturas con coordenadas GPS válidas disponibles.</p>
        </div>
      )}
    </div>
  );
} 