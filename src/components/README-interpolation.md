# Modelo de Interpolación IDW en AgriBot

Este documento describe la implementación del modelo matemático de interpolación IDW (Inverse Distance Weighting) utilizado en el componente SensorMap para transformar datos puntuales georreferenciados en un conjunto continuo que forma un mapa de degradados.

## Fundamentos matemáticos

El método IDW (Ponderación Inversa a la Distancia) es una técnica de interpolación espacial que asigna valores a ubicaciones desconocidas utilizando valores medidos en puntos conocidos cercanos, ponderados por la distancia entre ellos. 

La fórmula básica es:

```
V(x) = Σ(wi(x) · vi) / Σ(wi(x))

donde:
- V(x) es el valor interpolado en la ubicación x
- vi es el valor conocido en el punto i
- wi(x) es el peso asignado al punto i para la ubicación x
- wi(x) = 1/d(x,xi)^p
- d(x,xi) es la distancia entre la ubicación x y el punto i
- p es el exponente de ponderación (típicamente 2)
```

## Mejoras implementadas

Nuestra implementación incluye varias mejoras sobre el IDW básico:

1. **Suavizado exponencial**: Añadimos un factor de decaimiento exponencial:
   ```
   wi(x) = 1/d(x,xi)^p · e^(-d/r)
   ```
   donde r es el radio de influencia adaptativo.

2. **Radio de influencia adaptativo**: Calculado automáticamente basado en la densidad de puntos.

3. **Potencia variable**: Ajustada según:
   - El tipo de variable (temperatura, humedad, salinidad)
   - La configuración de intensidad seleccionada por el usuario

4. **Cuadrícula dinámica**: La densidad de la cuadrícula de interpolación se ajusta según:
   - Número de puntos disponibles
   - Configuración de resolución seleccionada por el usuario

## Parámetros configurables

Los usuarios pueden configurar tres aspectos principales:

| Parámetro | Opciones | Efecto |
|-----------|----------|--------|
| Resolución | Baja, Media, Alta | Define la densidad de la cuadrícula de interpolación |
| Intensidad | Baja, Media, Alta | Modifica el exponente de ponderación (p) |
| Suavizado | Activado, Desactivado | Activa o desactiva el factor de decaimiento exponencial |

## Visualización

La visualización de los datos interpolados se realiza mediante una capa de mapa de calor (heatmap) con:

- Gradientes de color específicos según la variable
- Opacidad adaptativa según la configuración
- Radio y desenfoque ajustables

## Consideraciones técnicas

- La implementación está optimizada para rendimiento en el navegador
- Se normalizan los valores según rangos específicos para cada variable
- Se añade énfasis a los puntos originales cuando hay pocos datos
- Se filtran puntos de muy baja intensidad para reducir ruido visual

## Referencias

- Shepard, Donald (1968). "A two-dimensional interpolation function for irregularly-spaced data"
- Franke, Richard (1982). "Scattered Data Interpolation: Tests of Some Methods"
- Bartier, Patricia M.; Keller, C. Peter (1996). "Multivariate interpolation to incorporate thematic surface data using inverse distance weighting (IDW)" 