-- CreateTable
CREATE TABLE "SensorData" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperatura" DOUBLE PRECISION,
    "humedad" DOUBLE PRECISION,
    "luz" DOUBLE PRECISION,
    "humedadSuelo" DOUBLE PRECISION,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "deviceId" TEXT NOT NULL,
    "bateria" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);
