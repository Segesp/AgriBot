#include <Arduino.h>
#include <Wire.h>
#include <SoftwareSerial.h>

// Configuración de pines para SIM800L
#define SIM800_TX_PIN 10  // Conectar a RX del SIM800L
#define SIM800_RX_PIN 11  // Conectar a TX del SIM800L

// Id del dispositivo
#define DEVICE_ID "ESP32_001"

// URL del servidor (reemplazar con la URL real)
const char* server = "tu-dominio.com";  // Actualizar con tu dominio o IP real
const int port = 80;

// Intervalo de envío de datos (en milisegundos)
const unsigned long SEND_INTERVAL = 600000; // 10 minutos

// Configuración de sensores (adaptar según los sensores reales)
const int TEMP_PIN = 36;       // Pin para sensor de temperatura
const int HUMIDITY_PIN = 39;   // Pin para sensor de humedad
const int LIGHT_PIN = 34;      // Pin para sensor de luz
const int SOIL_PIN = 35;       // Pin para sensor de humedad del suelo
const int BATTERY_PIN = 32;    // Pin para leer nivel de batería

// Serial para comunicarse con el SIM800L
SoftwareSerial sim800(SIM800_TX_PIN, SIM800_RX_PIN);

// Variables para almacenar la última vez que se enviaron datos
unsigned long lastSendTime = 0;

void setup() {
  // Inicializar comunicación serial
  Serial.begin(115200);
  Serial.println("Iniciando AgriBot ESP32 + SIM800L");
  
  // Inicializar SIM800L
  sim800.begin(9600);
  Serial.println("Iniciando SIM800L...");
  delay(3000);
  
  // Verificar si el módulo SIM800L está respondiendo
  sim800.println("AT");
  delay(1000);
  if (sim800.available()) {
    String response = sim800.readString();
    Serial.println("Respuesta SIM800L: " + response);
  } else {
    Serial.println("No hay respuesta del SIM800L. Verificar conexiones.");
  }
  
  // Configurar el módulo GPRS
  setupGPRS();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Verificar si es hora de enviar datos
  if (currentTime - lastSendTime >= SEND_INTERVAL || lastSendTime == 0) {
    // Leer datos de los sensores
    float temperatura = readTemperature();
    float humedad = readHumidity();
    float luz = readLight();
    float humedadSuelo = readSoilMoisture();
    float bateria = readBatteryLevel();
    
    // Enviar datos al servidor
    sendDataToServer(temperatura, humedad, luz, humedadSuelo, bateria);
    
    // Actualizar tiempo de último envío
    lastSendTime = currentTime;
  }
  
  // Procesar comandos entrantes o mensajes
  processIncomingMessages();
  
  delay(1000);
}

// Configurar conexión GPRS
void setupGPRS() {
  Serial.println("Configurando GPRS...");
  
  // Verificar estado de SIM
  sendATCommand("AT+CPIN?");
  delay(1000);
  
  // Verificar registro en la red
  sendATCommand("AT+CREG?");
  delay(1000);
  
  // Verificar calidad de señal
  sendATCommand("AT+CSQ");
  delay(1000);
  
  // Adjuntar a GPRS
  sendATCommand("AT+CGATT=1");
  delay(2000);
  
  // Configurar APN (ajustar según proveedor de servicio)
  sendATCommand("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(1000);
  sendATCommand("AT+SAPBR=3,1,\"APN\",\"internet\""); // Cambiar "internet" por el APN de tu operador
  delay(1000);
  
  // Activar el contexto GPRS
  sendATCommand("AT+SAPBR=1,1");
  delay(2000);
  
  // Verificar IP asignada
  sendATCommand("AT+SAPBR=2,1");
  delay(1000);
  
  Serial.println("Configuración GPRS completada");
}

// Enviar comando AT y mostrar respuesta
void sendATCommand(String command) {
  Serial.print("Enviando: ");
  Serial.println(command);
  sim800.println(command);
  delay(500);
  while (sim800.available()) {
    String response = sim800.readString();
    Serial.print(response);
  }
  Serial.println();
}

// Leer temperatura (simulada o desde sensor real)
float readTemperature() {
  // Reemplazar con código para leer sensor DHT22, BMP280, etc.
  int rawValue = analogRead(TEMP_PIN);
  float temperature = (rawValue * 3.3 / 4095) * 100 - 50; // Conversión ejemplar
  Serial.print("Temperatura: ");
  Serial.println(temperature);
  return temperature;
}

// Leer humedad (simulada o desde sensor real)
float readHumidity() {
  // Reemplazar con código para leer sensor DHT22, etc.
  int rawValue = analogRead(HUMIDITY_PIN);
  float humidity = map(rawValue, 0, 4095, 0, 10000) / 100.0; // Conversión ejemplar
  Serial.print("Humedad: ");
  Serial.println(humidity);
  return humidity;
}

// Leer nivel de luz (simulada o desde sensor real)
float readLight() {
  // Reemplazar con código para leer sensor LDR o BH1750
  int rawValue = analogRead(LIGHT_PIN);
  float light = map(rawValue, 0, 4095, 0, 10000); // Conversión ejemplar
  Serial.print("Luz: ");
  Serial.println(light);
  return light;
}

// Leer humedad del suelo (simulada o desde sensor real)
float readSoilMoisture() {
  // Reemplazar con código para leer sensor de humedad del suelo
  int rawValue = analogRead(SOIL_PIN);
  float moisture = map(rawValue, 0, 4095, 0, 10000) / 100.0; // Conversión ejemplar
  Serial.print("Humedad del suelo: ");
  Serial.println(moisture);
  return moisture;
}

// Leer nivel de batería (simulada o desde divisor de voltaje real)
float readBatteryLevel() {
  // Reemplazar con código para leer nivel de batería
  int rawValue = analogRead(BATTERY_PIN);
  float voltage = rawValue * 3.3 * 2 / 4095; // Asumiendo un divisor de voltaje 1:1
  // Convertir a porcentaje (asumiendo batería de 3.7V - 4.2V)
  float percentage = (voltage - 3.7) * 200; // Conversión simple
  if (percentage > 100) percentage = 100;
  if (percentage < 0) percentage = 0;
  Serial.print("Batería: ");
  Serial.println(percentage);
  return percentage;
}

// Enviar datos al servidor
void sendDataToServer(float temperatura, float humedad, float luz, float humedadSuelo, float bateria) {
  Serial.println("Enviando datos al servidor...");
  
  // Iniciar conexión HTTP
  sendATCommand("AT+HTTPINIT");
  delay(1000);
  
  // Configurar parámetros HTTP
  sendATCommand("AT+HTTPPARA=\"CID\",1");
  delay(1000);
  
  // Formar URL con datos (método GET - más simple pero menos seguro)
  String url = "http://" + String(server) + "/api/datos?deviceId=" + String(DEVICE_ID) + 
               "&temperatura=" + String(temperatura) + 
               "&humedad=" + String(humedad) + 
               "&luz=" + String(luz) + 
               "&humedadSuelo=" + String(humedadSuelo) + 
               "&bateria=" + String(bateria);
               
  // Configurar URL
  sendATCommand("AT+HTTPPARA=\"URL\",\"" + url + "\"");
  delay(1000);
  
  // Iniciar solicitud HTTP GET
  sendATCommand("AT+HTTPACTION=0");
  delay(5000); // Esperar respuesta
  
  // Leer respuesta
  sendATCommand("AT+HTTPREAD");
  delay(1000);
  
  // Terminar sesión HTTP
  sendATCommand("AT+HTTPTERM");
  delay(1000);
  
  Serial.println("Datos enviados");
}

// Procesar mensajes entrantes (para comandos remotos)
void processIncomingMessages() {
  if (sim800.available()) {
    String response = sim800.readString();
    Serial.println("Mensaje recibido: " + response);
    // Aquí puedes implementar lógica para responder a comandos SMS
  }
} 