// Declaraciones para bibliotecas que carecen de tipos
declare module 'd3-scale-chromatic';
declare module 'd3-scale';

// Extensiones para tipos existentes
import 'chart.js';

// Añadir propiedades opcionales a los datasets de Chart.js
declare module 'chart.js' {
  interface LineControllerDatasetOptions {
    borderDash?: number[];
  }
} 