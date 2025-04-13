# AgriBot Dashboard

Una aplicación web moderna para visualizar datos de sensores enviados desde un ESP32 mediante un módulo SIM800L.

## Características

- 🌡️ Visualización en tiempo real de datos de sensores (temperatura, humedad, luz, humedad del suelo)
- 📊 Gráficos históricos interactivos
- 🔋 Monitoreo de batería del dispositivo
- 📱 Diseño responsive para móviles, tablets y escritorio
- 🔄 Actualización automática de datos
- 🗺️ Soporte para datos de ubicación GPS (opcional)

## Tecnologías Utilizadas

- **Frontend**: Next.js, React, TailwindCSS
- **Gráficos**: Chart.js, react-chartjs-2
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite con Prisma ORM
- **Cliente HTTP**: Axios

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- ESP32 con módulo SIM800L (para la parte de hardware)

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/agribot-dashboard.git
   cd agribot-dashboard
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar la base de datos:
   ```bash
   npx prisma migrate dev
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Visita `http://localhost:3000` en tu navegador.

## Configuración del ESP32

En la carpeta `examples` encontrarás el archivo `ESP32_SIM800L.ino` con un código de ejemplo para configurar tu ESP32 con el módulo SIM800L. Necesitarás:

1. Arduino IDE o PlatformIO
2. Bibliotecas: SoftwareSerial, Wire
3. Sensores (opcional): temperatura, humedad, luz, humedad del suelo
4. Módulo SIM800L con tarjeta SIM con plan de datos

Ajusta los siguientes parámetros en el código:
- La URL del servidor donde se aloja la aplicación
- El APN de tu proveedor de telefonía móvil
- El ID único del dispositivo
- Los pines conectados a cada sensor

## Uso de la API

La aplicación expone los siguientes endpoints:

- `POST /api/datos`: Para enviar datos desde el ESP32
  ```json
  {
    "deviceId": "ESP32_001",
    "temperatura": 25.5,
    "humedad": 65.2,
    "luz": 3500,
    "humedadSuelo": 42.8,
    "bateria": 87.3,
    "latitud": 19.4326,
    "longitud": -99.1332
  }
  ```

- `GET /api/datos`: Para obtener los últimos datos (usado por el dashboard)

## Despliegue

Para desplegar la aplicación en producción:

1. Construye la aplicación:
   ```bash
   npm run build
   ```

2. Inicia el servidor en producción:
   ```bash
   npm start
   ```

Para despliegue en plataformas como Vercel o Netlify, asegúrate de configurar correctamente las variables de entorno para la conexión a la base de datos.

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios propuestos antes de enviar un pull request.

## Licencia

[MIT](LICENSE)
