-- CreateTable
CREATE TABLE "SensorData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperatura" REAL,
    "humedad" REAL,
    "luz" REAL,
    "humedadSuelo" REAL,
    "latitud" REAL,
    "longitud" REAL,
    "deviceId" TEXT NOT NULL,
    "bateria" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
