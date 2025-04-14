'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { interpolateYlOrRd, interpolateRdYlBu, interpolateViridis } from 'd3-scale-chromatic';
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
  ph?: number | null;
  nutrientes?: string | null;
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
const getMarkerOptions = (value: number | null, metric: string): MarkerOptions => {
  if (value === null) return { color: '#777', fillColor: '#999', radius: 8 };
  
  // Escalas de colores basadas en el tipo de métrica
  let colorScale;
  
  switch(metric) {
    case 'temperatura':
      // Escala para temperatura: Azul (frío) a Rojo (caliente)
      colorScale = scaleLinear<string>()
        .domain([0, 15, 23, 30, 40])
        .range(['#4575b4', '#91bfdb', '#ffffbf', '#fc8d59', '#d73027'])
        .clamp(true);
      return {
        color: '#333',
        weight: 1,
        fillColor: colorScale(value),
        fillOpacity: 0.8,
        radius: 8 + Math.min(value / 5, 4),
      };
      
    case 'humedadSuelo':
      // Escala para humedad: Rojo (seco) a Azul (húmedo)
      colorScale = scaleLinear<string>()
        .domain([0, 20, 50, 80, 100])
        .range(['#d73027', '#fc8d59', '#ffffbf', '#91bfdb', '#4575b4'])
        .clamp(true);
      return {
        color: '#333',
        weight: 1,
        fillColor: colorScale(value),
        fillOpacity: 0.8,
        radius: 8 + Math.min(value / 12, 3),
      };
      
    case 'salinidad':
    default:
      // Escala para salinidad: Verde (óptimo) a Rojo (alto)
      colorScale = scaleLinear<string>()
        .domain([0, 2, 4, 8])
        .range(['#4ade80', '#facc15', '#f97316', '#ef4444'])
        .clamp(true);
      return {
        color: '#333',
        weight: 1,
        fillColor: colorScale(value),
        fillOpacity: 0.8,
        radius: 8 + Math.min(value, 8) * 0.5,
      };
  }
};

// Clase para generar la leyenda de acuerdo a la métrica seleccionada
class LegendControl extends L.Control {
  private metric: string;
  
  constructor(options: L.ControlOptions, metric: string) {
    super(options);
    this.metric = metric;
  }
  
  onAdd(map: L.Map): HTMLElement {
    const div = L.DomUtil.create('div', 'legend');
    
    // Contenido para diferentes métricas
    let content = '';
    
    switch(this.metric) {
      case 'temperatura':
        content = `
          <h4 style="margin: 0 0 8px; font-size: 14px">Temperatura del Suelo (°C)</h4>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #4575b4; margin-right: 5px"></div>
            <span>&lt; 10 (Frío)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #91bfdb; margin-right: 5px"></div>
            <span>10 - 18 (Fresco)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #ffffbf; margin-right: 5px"></div>
            <span>18 - 25 (Óptimo)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #fc8d59; margin-right: 5px"></div>
            <span>25 - 30 (Cálido)</span>
          </div>
          <div style="display: flex; align-items: center">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #d73027; margin-right: 5px"></div>
            <span>&gt; 30 (Caliente)</span>
          </div>
        `;
        break;
        
      case 'humedadSuelo':
        content = `
          <h4 style="margin: 0 0 8px; font-size: 14px">Humedad del Suelo (%)</h4>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #d73027; margin-right: 5px"></div>
            <span>&lt; 20 (Muy seco)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #fc8d59; margin-right: 5px"></div>
            <span>20 - 40 (Seco)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #ffffbf; margin-right: 5px"></div>
            <span>40 - 60 (Óptimo)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #91bfdb; margin-right: 5px"></div>
            <span>60 - 80 (Húmedo)</span>
          </div>
          <div style="display: flex; align-items: center">
            <div style="width: 15px; height: 15px; border-radius: 50%; background: #4575b4; margin-right: 5px"></div>
            <span>&gt; 80 (Saturado)</span>
          </div>
        `;
        break;
        
      case 'salinidad':
      default:
        content = `
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
        `;
    }
    
    div.innerHTML = `
      <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2)">
        ${content}
      </div>
    `;
    
    return div;
  }
}

// URL de los tiles para mapas topográficos
const TOPOGRAPHIC_TILES = {
  OpenTopoMap: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  },
  USGS_Topo: {
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
  },
  Stamen_Terrain: {
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  ESRI_Topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  },
  ESRI_Imagery: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Función para preparar los datos para el heatmap con mejor interpolación
const prepareHeatmapData = (data: GeoData[], metric: string): [number, number, number][] => {
  // Obtener parámetros de configuración de interpolación (si están disponibles)
  const params = typeof window !== 'undefined' ? (window as any).__interpolationParams : null;
  const gridSize = params?.gridSize || (data.length < 10 ? 40 : data.length < 30 ? 50 : 60);
  const potencia = params?.potencia || (
    metric === 'temperatura' ? 2.0 :
    metric === 'humedadSuelo' ? 2.5 :
    metric === 'salinidad' ? 2.8 : 2.2
  );
  const usarSuavizado = params?.smoothing !== undefined ? params.smoothing : true;
  
  // Si no hay suficientes datos para interpolar, devolver los puntos originales
  if (data.length <= 1) {
    return data.map(point => {
      let value = 0;
      switch (metric) {
        case 'temperatura':
          value = point.temperatura !== null ? point.temperatura / 40 : 0;
          break;
        case 'humedadSuelo':
          value = point.humedadSuelo !== null ? point.humedadSuelo / 100 : 0;
          break;
        case 'salinidad':
          value = point.salinidad !== null ? Math.min(point.salinidad / 8, 1) : 0;
          break;
        default:
          value = 0.5;
      }
      return [point.latitud, point.longitud, value];
    }) as [number, number, number][];
  }
  
  // Implementación de IDW (Inverse Distance Weighting) con suavizado adaptativo
  
  // 1. Extraer coordenadas y valores según la métrica seleccionada
  const coordenadas: [number, number][] = data.map(p => [p.latitud, p.longitud]);
  const valores: number[] = data.map(p => {
    switch (metric) {
      case 'temperatura':
        return p.temperatura !== null ? p.temperatura : 0;
      case 'humedadSuelo':
        return p.humedadSuelo !== null ? p.humedadSuelo : 0;
      case 'salinidad':
        return p.salinidad !== null ? p.salinidad : 0;
      default:
        return 0;
    }
  });
  
  // 2. Determinar límites del área a interpolar con margen
  const minLat = Math.min(...coordenadas.map(c => c[0])) - 0.02;
  const maxLat = Math.max(...coordenadas.map(c => c[0])) + 0.02;
  const minLng = Math.min(...coordenadas.map(c => c[1])) - 0.02;
  const maxLng = Math.max(...coordenadas.map(c => c[1])) + 0.02;
  
  // 3. Calcular la distancia promedio entre puntos para ajuste adaptativo
  // Esta función determina automáticamente el radio de influencia según la densidad de puntos
  const calcularDistanciaPromedio = (coords: [number, number][]): number => {
    if (coords.length <= 1) return 0.01;
    
    let sumaDistancias = 0;
    let contadorDistancias = 0;
    
    for (let i = 0; i < coords.length; i++) {
      for (let j = i+1; j < coords.length; j++) {
        const distancia = Math.sqrt(
          Math.pow(coords[i][0] - coords[j][0], 2) + 
          Math.pow(coords[i][1] - coords[j][1], 2)
        );
        sumaDistancias += distancia;
        contadorDistancias++;
      }
    }
    
    return contadorDistancias > 0 ? sumaDistancias / contadorDistancias : 0.01;
  };
  
  // 4. Determinar parámetros de interpolación
  const distanciaPromedio = calcularDistanciaPromedio(coordenadas);
  const radioInfluencia = Math.max(distanciaPromedio * 2, 0.01);
  
  // 5. Generar puntos interpolados en la cuadrícula
  const resultado: [number, number, number][] = [];
  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;
  
  // Optimización: pre-calcular valores para puntos con alta densidad
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lat = minLat + (i / gridSize) * latRange;
      const lng = minLng + (j / gridSize) * lngRange;
      
      // Calcular valor interpolado con IDW
      let sumaPesos = 0;
      let sumaValores = 0;
      
      for (let k = 0; k < coordenadas.length; k++) {
        const distancia = Math.sqrt(
          Math.pow(lat - coordenadas[k][0], 2) + 
          Math.pow(lng - coordenadas[k][1], 2)
        );
        
        // Aplicar función de decaimiento con suavizado exponencial
        // Si estamos en el punto exacto, usar el valor sin interpolación
        let peso;
        if (distancia < 0.0001) {
          peso = 999999; // Valor muy alto para punto exacto
        } else {
          // Aplicar diferentes fórmulas según configuración
          peso = 1 / Math.pow(distancia, potencia);
          
          // Aplicar suavizado exponencial si está activado
          if (usarSuavizado) {
            peso *= Math.exp(-distancia/radioInfluencia);
          }
        }
        
        sumaPesos += peso;
        sumaValores += peso * valores[k];
      }
      
      // Normalizar el valor interpolado
      let valorInterpolado = sumaPesos > 0 ? sumaValores / sumaPesos : 0;
      
      // Normalizar según la métrica para visualización en el heatmap
      switch (metric) {
        case 'temperatura':
          valorInterpolado = valorInterpolado / 40; // Normalizar a 0-1
          break;
        case 'humedadSuelo':
          valorInterpolado = valorInterpolado / 100; // Normalizar a 0-1
          break;
        case 'salinidad':
          valorInterpolado = Math.min(valorInterpolado / 8, 1); // Normalizar a 0-1
          break;
      }
      
      // Solo incluir puntos con valor significativo para reducir ruido visual
      if (valorInterpolado > 0.005) {
        resultado.push([lat, lng, valorInterpolado]);
      }
    }
  }
  
  // 6. Para áreas con pocos puntos, reforzar los valores en las ubicaciones originales
  // Esto mejora la visualización asegurando que los puntos medidos tengan énfasis
  if (data.length < 15) {
    data.forEach(point => {
      let valor = 0;
      switch (metric) {
        case 'temperatura':
          valor = point.temperatura !== null ? point.temperatura / 40 : 0;
          break;
        case 'humedadSuelo':
          valor = point.humedadSuelo !== null ? point.humedadSuelo / 100 : 0;
          break;
        case 'salinidad':
          valor = point.salinidad !== null ? Math.min(point.salinidad / 8, 1) : 0;
          break;
      }
      // Añadir el punto original con intensidad ligeramente mayor
      if (valor > 0) {
        resultado.push([point.latitud, point.longitud, valor * 1.2]);
      }
    });
  }
  
  return resultado;
};

// Componente principal del mapa
export default function SensorMap({ data }: { data: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [activeMetric, setActiveMetric] = useState<string>('salinidad');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const heatLayer = useRef<any>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  // Nuevo estado para configuración de interpolación
  const [interpolationConfig, setInterpolationConfig] = useState({
    resolution: 'media', // baja, media, alta
    intensity: 'media',  // baja, media, alta
    smoothing: true      // suavizado activado/desactivado
  });
  
  // Cargar el plugin leaflet.heat dinámicamente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verificar si ya está cargado
      if (!(L as any).heatLayer) {
        // Crear y añadir el script al documento
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
        script.async = true;
        script.onload = () => {
          console.log('Leaflet.heat cargado correctamente');
        };
        document.body.appendChild(script);
      }
    }
  }, []);
  
  // Solucionar problemas con iconos de Leaflet en Next.js
  useEffect(() => {
    (async () => {
      // Solo en el cliente para evitar errores en SSR
      if (typeof window !== 'undefined') {
        // @ts-ignore - Ignorar error de tipado para L.Icon.Default
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
      }
    })();
  }, []);
  
  // Inicializar y actualizar el mapa cuando cambian los datos
  useEffect(() => {
    // Si no hay datos o no existe el contenedor, salir
    if (!mapRef.current) return;
    
    // Filtrar solo datos válidos para el mapa
    const validData = filterValidCoordinates(data);
    
    if (!leafletMap.current) {
      // Inicializar el mapa
      leafletMap.current = L.map(mapRef.current, {
        preferCanvas: true, // Mejora el rendimiento
        attributionControl: true,
        zoomControl: true
      });
      
      // Añadir capa base de mapa topográfico - Usamos ESRI_Topo como predeterminado
      L.tileLayer(TOPOGRAPHIC_TILES.ESRI_Topo.url, {
        attribution: TOPOGRAPHIC_TILES.ESRI_Topo.attribution,
        maxZoom: 18
      }).addTo(leafletMap.current);
      
      // Añadir control de capas para poder seleccionar diferentes mapas topográficos
      const baseLayers = {
        "ESRI Topográfico": L.tileLayer(TOPOGRAPHIC_TILES.ESRI_Topo.url, {
          attribution: TOPOGRAPHIC_TILES.ESRI_Topo.attribution,
          maxZoom: 18
        }),
        "OpenTopoMap": L.tileLayer(TOPOGRAPHIC_TILES.OpenTopoMap.url, {
          attribution: TOPOGRAPHIC_TILES.OpenTopoMap.attribution,
          maxZoom: 17
        }),
        "USGS Topo": L.tileLayer(TOPOGRAPHIC_TILES.USGS_Topo.url, {
          attribution: TOPOGRAPHIC_TILES.USGS_Topo.attribution,
          maxZoom: 16
        }),
        "Stamen Terrain": L.tileLayer(TOPOGRAPHIC_TILES.Stamen_Terrain.url, {
          attribution: TOPOGRAPHIC_TILES.Stamen_Terrain.attribution,
          maxZoom: 18
        }),
        "ESRI Imágenes Satelitales": L.tileLayer(TOPOGRAPHIC_TILES.ESRI_Imagery.url, {
          attribution: TOPOGRAPHIC_TILES.ESRI_Imagery.attribution,
          maxZoom: 18
        })
      };
      
      L.control.layers(baseLayers, {}).addTo(leafletMap.current);
      
      // Crear capa de marcadores
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
      
      // Si no hay datos válidos, mostrar mapa en posición por defecto
      if (validData.length === 0) {
        leafletMap.current.setView([40.416775, -3.703790], 5); // Centro en España por defecto
      }
      
      // Añadir controles para la selección de métricas
      const metricControl = new L.Control({ position: 'topleft' });
      
      metricControl.onAdd = function(map: L.Map) {
        const div = L.DomUtil.create('div', 'metric-control');
        div.innerHTML = `
          <div style="background: white; padding: 5px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); margin-bottom: 5px">
            <div style="margin-bottom: 5px; font-weight: bold; font-size: 12px">Métrica:</div>
            <div>
              <label style="display: block; margin-bottom: 3px; font-size: 12px">
                <input type="radio" name="metric" value="salinidad" checked> Salinidad
              </label>
              <label style="display: block; margin-bottom: 3px; font-size: 12px">
                <input type="radio" name="metric" value="temperatura"> Temperatura
              </label>
              <label style="display: block; margin-bottom: 3px; font-size: 12px">
                <input type="radio" name="metric" value="humedadSuelo"> Humedad
              </label>
            </div>
            <div style="margin-top: 10px">
              <label style="display: block; font-size: 12px">
                <input type="checkbox" name="heatmap" checked> Mapa de calor
              </label>
            </div>
          </div>
        `;
        
        // Eventos para los controles
        setTimeout(() => {
          const radioButtons = div.querySelectorAll('input[type="radio"]');
          radioButtons.forEach(radio => {
            radio.addEventListener('change', function(e) {
              const target = e.target as HTMLInputElement;
              setActiveMetric(target.value);
            });
          });
          
          const checkbox = div.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.addEventListener('change', function(e) {
              const target = e.target as HTMLInputElement;
              setShowHeatmap(target.checked);
            });
          }
          
          // Prevenir que los clics en los controles se propaguen al mapa
          L.DomEvent.disableClickPropagation(div);
        }, 100);
        
        return div;
      };
      
      metricControl.addTo(leafletMap.current);
      
      // Añadir control para configuración de interpolación
      const interpolationControl = new L.Control({ position: 'topleft' });
      
      interpolationControl.onAdd = function(map: L.Map) {
        const div = L.DomUtil.create('div', 'interpolation-control');
        div.innerHTML = `
          <div style="background: white; padding: 5px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); margin-top: 10px; margin-bottom: 5px; width: 170px;">
            <div style="margin-bottom: 5px; font-weight: bold; font-size: 12px">Interpolación:</div>
            <div>
              <label style="display: block; margin-bottom: 3px; font-size: 12px">Resolución:</label>
              <select id="resolution" style="width: 100%; font-size: 12px; padding: 2px;">
                <option value="baja" ${interpolationConfig.resolution === 'baja' ? 'selected' : ''}>Baja</option>
                <option value="media" ${interpolationConfig.resolution === 'media' ? 'selected' : ''}>Media</option>
                <option value="alta" ${interpolationConfig.resolution === 'alta' ? 'selected' : ''}>Alta</option>
              </select>
            </div>
            <div style="margin-top: 5px;">
              <label style="display: block; margin-bottom: 3px; font-size: 12px">Intensidad:</label>
              <select id="intensity" style="width: 100%; font-size: 12px; padding: 2px;">
                <option value="baja" ${interpolationConfig.intensity === 'baja' ? 'selected' : ''}>Baja</option>
                <option value="media" ${interpolationConfig.intensity === 'media' ? 'selected' : ''}>Media</option>
                <option value="alta" ${interpolationConfig.intensity === 'alta' ? 'selected' : ''}>Alta</option>
              </select>
            </div>
            <div style="margin-top: 5px;">
              <label style="display: block; font-size: 12px">
                <input type="checkbox" id="smoothing" ${interpolationConfig.smoothing ? 'checked' : ''}>
                Suavizado
              </label>
            </div>
            <button id="apply-interpolation" style="margin-top: 5px; width: 100%; padding: 3px; font-size: 12px; background: #4575b4; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Aplicar
            </button>
          </div>
        `;
        
        // Eventos para los controles
        setTimeout(() => {
          const resolutionSelect = div.querySelector('#resolution') as HTMLSelectElement;
          const intensitySelect = div.querySelector('#intensity') as HTMLSelectElement;
          const smoothingCheck = div.querySelector('#smoothing') as HTMLInputElement;
          const applyButton = div.querySelector('#apply-interpolation') as HTMLButtonElement;
          
          applyButton.addEventListener('click', function() {
            setInterpolationConfig({
              resolution: resolutionSelect.value as 'baja' | 'media' | 'alta',
              intensity: intensitySelect.value as 'baja' | 'media' | 'alta',
              smoothing: smoothingCheck.checked
            });
          });
          
          // Prevenir que los clics en los controles se propaguen al mapa
          L.DomEvent.disableClickPropagation(div);
        }, 100);
        
        return div;
      };
      
      interpolationControl.addTo(leafletMap.current);
    }
    
    // Si no hay datos válidos, salir
    if (validData.length === 0) return;
    
    // Actualizar el mapa con nuevos datos
    // 1. Limpiar capas existentes
    if (markersLayer.current) {
      markersLayer.current.clearLayers();
    }
    
    if (heatLayer.current) {
      leafletMap.current.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }
    
    // 2. Añadir marcadores según la métrica seleccionada
    validData.forEach((point) => {
      const value = point[activeMetric as keyof GeoData] as number | null;
      const circle = L.circleMarker(
        [point.latitud, point.longitud], 
        getMarkerOptions(value, activeMetric)
      );
      
      // Contenido del popup
      const date = new Date(point.timestamp).toLocaleString('es-ES');
      const popupContent = `
        <div style="min-width: 200px">
          <h3 style="margin: 0 0 8px; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px">
            ${point.deviceId} | ${date}
          </h3>
          <table style="width: 100%; border-collapse: collapse">
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Temperatura:</td>
              <td style="padding: 3px 5px">${point.temperatura !== null ? `${point.temperatura.toFixed(1)}°C` : 'N/D'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Humedad:</td>
              <td style="padding: 3px 5px">${point.humedadSuelo !== null ? `${point.humedadSuelo.toFixed(1)}%` : 'N/D'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Salinidad:</td>
              <td style="padding: 3px 5px">${point.salinidad !== null ? `${point.salinidad.toFixed(2)} dS/m` : 'N/D'}</td>
            </tr>
            ${point.ph !== undefined ? `
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">pH:</td>
              <td style="padding: 3px 5px">${point.ph !== null ? `${point.ph.toFixed(1)}` : 'N/D'}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 3px 5px; font-weight: bold">Coordenadas:</td>
              <td style="padding: 3px 5px">${point.latitud.toFixed(5)}, ${point.longitud.toFixed(5)}</td>
            </tr>
          </table>
        </div>
      `;
      
      circle.bindPopup(popupContent);
      
      if (markersLayer.current) {
        markersLayer.current.addLayer(circle);
      }
    });
    
    // 3. Añadir heatmap si está activado
    if (showHeatmap && validData.length > 0) {
      // Comprobar que el plugin leaflet.heat esté cargado
      if ((L as any).heatLayer) {
        // Usar la función que considera la configuración
        const heatData = prepareHeatmapDataWithConfig(validData, activeMetric);
        
        // Ajustar los parámetros del heatmap según la configuración
        const heatmapRadius = interpolationConfig.resolution === 'alta' ? 20 : 
                             interpolationConfig.resolution === 'baja' ? 30 : 25;
        
        const heatmapBlur = interpolationConfig.smoothing ? 
                           (interpolationConfig.resolution === 'alta' ? 10 : 15) : 
                           (interpolationConfig.resolution === 'alta' ? 5 : 8);
        
        // @ts-ignore - L.heatLayer no es reconocido por TypeScript
        heatLayer.current = (L as any).heatLayer(heatData, {
          radius: heatmapRadius,
          blur: heatmapBlur,
          maxZoom: 17,
          minOpacity: interpolationConfig.intensity === 'alta' ? 0.5 : 
                     interpolationConfig.intensity === 'baja' ? 0.3 : 0.4,
          gradient: {
            0.0: activeMetric === 'temperatura' ? '#4575b4' : 
                  activeMetric === 'humedadSuelo' ? '#d73027' : '#4ade80',
            0.25: activeMetric === 'temperatura' ? '#91bfdb' : 
                  activeMetric === 'humedadSuelo' ? '#fc8d59' : '#facc15',
            0.5: activeMetric === 'temperatura' ? '#ffffbf' : 
                  activeMetric === 'humedadSuelo' ? '#ffffbf' : '#facc15',
            0.75: activeMetric === 'temperatura' ? '#fc8d59' : 
                  activeMetric === 'humedadSuelo' ? '#91bfdb' : '#f97316',
            1.0: activeMetric === 'temperatura' ? '#d73027' : 
                  activeMetric === 'humedadSuelo' ? '#4575b4' : '#ef4444',
          }
        }).addTo(leafletMap.current);
        
        // Ajustar la opacidad de los marcadores para que el heatmap sea más visible
        markersLayer.current?.eachLayer((layer: any) => {
          if (layer.setStyle) {
            layer.setStyle({ fillOpacity: 0.4, opacity: 0.6 });
          }
        });
        
        // Añadir control de información sobre el modelo matemático utilizado
        const infoControl = new L.Control({ position: 'bottomleft' });
        infoControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'info-control');
          div.innerHTML = `
            <div style="background: rgba(255,255,255,0.8); padding: 8px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); font-size: 11px; max-width: 200px;">
              <div style="margin-bottom: 3px; font-weight: bold;">Modelo de Interpolación</div>
              <div>IDW (Inverse Distance Weighting) adaptativo con:</div>
              <ul style="margin: 3px 0 3px 15px; padding: 0;">
                <li>Resolución: ${interpolationConfig.resolution}</li>
                <li>Intensidad: ${interpolationConfig.intensity}</li>
                <li>Suavizado: ${interpolationConfig.smoothing ? 'Activado' : 'Desactivado'}</li>
                <li>Potencia: ${(window as any).__interpolationParams?.potencia.toFixed(1) || '2.2'}</li>
              </ul>
              <div style="font-style: italic; margin-top: 3px; font-size: 10px;">
                Los valores continuos se calculan ponderando los puntos cercanos con mayor influencia.
              </div>
            </div>
          `;
          return div;
        };
        
        // Eliminar controles de info previos para evitar duplicados
        document.querySelectorAll('.info-control').forEach(el => el.remove());
        infoControl.addTo(leafletMap.current);
      } else {
        // Mostrar mensaje si el plugin no está disponible
        console.warn('Plugin leaflet.heat no disponible. No se muestra el mapa de calor.');
        
        // Añadir un mensaje en el mapa
        const warningControl = new L.Control({ position: 'bottomleft' });
        warningControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'warning-control');
          div.innerHTML = `
            <div style="background: rgba(255,255,255,0.8); padding: 8px; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); font-size: 11px;">
              <div style="color: #e65100; font-weight: bold;">Mapa de calor no disponible</div>
              <div>Mostrando solo marcadores de datos.</div>
            </div>
          `;
          return div;
        };
        
        // Eliminar mensajes previos para evitar duplicados
        document.querySelectorAll('.warning-control').forEach(el => el.remove());
        warningControl.addTo(leafletMap.current);
      }
    }
    
    // 4. Actualizar la leyenda
    document.querySelectorAll('.legend').forEach(el => el.remove());
    const legend = new LegendControl({ position: 'bottomright' }, activeMetric);
    legend.addTo(leafletMap.current);
    
    // 5. Ajustar la vista del mapa
    // Coordenadas para ajustar la vista
    const latitudes = validData.map(d => d.latitud);
    const longitudes = validData.map(d => d.longitud);
    
    // Calcular centro y extensión del mapa
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
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
    
    // Asegurar que el mapa se renderice correctamente
    leafletMap.current.invalidateSize();
    
  }, [data, activeMetric, showHeatmap, interpolationConfig]);
  
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
  
  // Modificar la función prepareHeatmapData para usar la configuración de interpolación
  const prepareHeatmapDataWithConfig = (data: GeoData[], metric: string): [number, number, number][] => {
    // Ajustar parámetros según la configuración
    const getGridSize = () => {
      switch(interpolationConfig.resolution) {
        case 'baja': return data.length < 10 ? 30 : data.length < 30 ? 40 : 50;
        case 'alta': return data.length < 10 ? 60 : data.length < 30 ? 70 : 80;
        default: return data.length < 10 ? 40 : data.length < 30 ? 50 : 60; // media
      }
    };
    
    const getPotencia = () => {
      let basePotencia = 2.2;
      
      // Ajustar según la métrica
      if (metric === 'temperatura') {
        basePotencia = 2.0;
      } else if (metric === 'humedadSuelo') {
        basePotencia = 2.5;
      } else if (metric === 'salinidad') {
        basePotencia = 2.8;
      }
      
      // Modificar según intensidad seleccionada
      switch(interpolationConfig.intensity) {
        case 'baja': return basePotencia - 0.5;
        case 'alta': return basePotencia + 0.5;
        default: return basePotencia; // media
      }
    };
    
    // Llamar a la función original con los parámetros modificados
    // Para simplificar, pasamos estos valores como variables globales temporales
    // que serán usadas dentro de prepareHeatmapData
    (window as any).__interpolationParams = {
      gridSize: getGridSize(),
      potencia: getPotencia(),
      smoothing: interpolationConfig.smoothing
    };
    
    return prepareHeatmapData(data, metric);
  };
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white relative">
      <div ref={mapRef} className="h-[500px] w-full"></div>
      
      {/* Mensaje para datos insuficientes */}
      {filterValidCoordinates(data).length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md z-[1000] text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Sin datos georreferenciados</h3>
          <p className="text-gray-600">No hay lecturas con coordenadas GPS válidas disponibles.</p>
        </div>
      )}
      
      {/* Info sobre el modelo matemático */}
      <div className="absolute bottom-2 right-2 z-[500]">
        <div className="bg-white bg-opacity-70 px-2 py-1 rounded text-xs text-gray-600">
          Modelo IDW con suavizado exponencial
        </div>
      </div>
    </div>
  );
} 