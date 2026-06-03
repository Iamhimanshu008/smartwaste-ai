/*
 * SmartWaste AI — ESP32 IoT Scale Firmware
 * Hardware: ESP32 + HX711 Load Cell
 * Protocol: HTTPS POST to FastAPI backend
 * 
 * SETUP REQUIRED:
 *   1. Install libraries: HX711 by Bogdan Necula, ArduinoJson, WiFiClientSecure
 *   2. Fill in your WiFi credentials below
 *   3. Flash to ESP32 via Arduino IDE or PlatformIO
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <HX711.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ─── CONFIGURATION ───────────────────────────────────────────────
#define WIFI_SSID        "YOUR_WIFI_SSID"
#define WIFI_PASSWORD    "YOUR_WIFI_PASSWORD"
#define BACKEND_URL      "https://smartwaste-ai-f0i9.onrender.com"
#define IOT_API_KEY      "SF6NdRKNtPSSfdttgSEbS9ZDgNpjFG1YP3Jg6ENyynA"
#define SCALE_DEVICE_ID  "ESP32-SCALE-001"

// ─── HX711 PIN CONFIG ────────────────────────────────────────────
#define HX711_DOUT_PIN   4
#define HX711_SCK_PIN    5

// ─── BLE CONFIG ──────────────────────────────────────────────────
// Service UUID and Characteristic UUID must match BleService.js in mobile app
#define BLE_SERVICE_UUID        "0000FFE0-0000-1000-8000-00805F9B34FB"
#define BLE_CHARACTERISTIC_UUID "0000FFE1-0000-1000-8000-00805F9B34FB"

// ─── STABILITY ALGORITHM CONFIG ──────────────────────────────────
// Weight is only accepted if reading is stable for this many consecutive checks
#define STABILITY_SAMPLES       10       // number of consecutive stable readings required
#define STABILITY_VARIANCE_G    5.0      // max allowed variance in grams between samples
#define SAMPLE_INTERVAL_MS      300      // ms between each stability sample

// ─── FRAUD PREVENTION: DENSITY CAP ──────────────────────────────
// Max weight for a standard 10-litre household bin of dry plastic waste
// If weight exceeds this, transaction is flagged AUDIT_REQUIRED on backend
#define MAX_WEIGHT_GRAMS        3000

// ─── GLOBALS ─────────────────────────────────────────────────────
HX711 scale;
BLECharacteristic* pCharacteristic = nullptr;
bool deviceConnected = false;
float calibrationFactor = 420.0;  // TODO: calibrate per physical scale unit

// ─── BLE SERVER CALLBACKS ────────────────────────────────────────
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    deviceConnected = true;
    Serial.println("[BLE] Collector app connected");
  }
  void onDisconnect(BLEServer* pServer) override {
    deviceConnected = false;
    Serial.println("[BLE] Collector app disconnected — restarting advertising");
    pServer->startAdvertising();
  }
};

// ─── SETUP ───────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("[SmartWaste] ESP32 Scale Firmware booting...");

  // HX711 init
  scale.begin(HX711_DOUT_PIN, HX711_SCK_PIN);
  scale.set_scale(calibrationFactor);
  scale.tare();
  Serial.println("[Scale] Tare complete. Ready.");

  // WiFi connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[WiFi] Connected: " + WiFi.localIP().toString());

  // BLE init
  BLEDevice::init("SmartWaste-Scale");
  BLEServer* pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService* pService = pServer->createService(BLE_SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    BLE_CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(BLE_SERVICE_UUID);
  pAdvertising->start();
  Serial.println("[BLE] Advertising as 'SmartWaste-Scale'");

  // Send heartbeat to backend on boot
  sendHeartbeat("online");
}

// ─── STABILITY CHECK ─────────────────────────────────────────────
// Returns stable weight in grams, or -1.0 if reading is unstable
// Implements PRD Section 8.1 — prevents hand-push fraud
float getStableWeight() {
  float samples[STABILITY_SAMPLES];

  for (int i = 0; i < STABILITY_SAMPLES; i++) {
    samples[i] = scale.get_units(3) * 1000.0;  // convert kg → grams
    delay(SAMPLE_INTERVAL_MS);
  }

  // Calculate variance across samples
  float minVal = samples[0], maxVal = samples[0];
  for (int i = 1; i < STABILITY_SAMPLES; i++) {
    if (samples[i] < minVal) minVal = samples[i];
    if (samples[i] > maxVal) maxVal = samples[i];
  }
  float variance = maxVal - minVal;

  if (variance > STABILITY_VARIANCE_G) {
    Serial.printf("[Scale] Unstable reading — variance: %.2fg (max allowed: %.0fg)\n",
                  variance, STABILITY_VARIANCE_G);
    return -1.0;
  }

  // Return average of stable samples
  float sum = 0;
  for (int i = 0; i < STABILITY_SAMPLES; i++) sum += samples[i];
  return sum / STABILITY_SAMPLES;
}

// ─── BLE BROADCAST ───────────────────────────────────────────────
// Sends weight integer to connected collector app via BLE notify
void broadcastWeightBLE(int weightGrams) {
  if (!deviceConnected || pCharacteristic == nullptr) return;

  // Format: plain integer string e.g. "850"
  // Mobile app (BleService.js) parses this directly
  String payload = String(weightGrams);
  pCharacteristic->setValue(payload.c_str());
  pCharacteristic->notify();
  Serial.printf("[BLE] Broadcasted weight: %dg\n", weightGrams);
}

// ─── BACKEND HEARTBEAT ───────────────────────────────────────────
void sendHeartbeat(const char* status) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();  // TODO: pin backend certificate for production
  HTTPClient http;

  String url = String(BACKEND_URL) + "/iot/heartbeat";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IoT-Api-Key", IOT_API_KEY);

  StaticJsonDocument<256> doc;
  doc["device_id"]   = SCALE_DEVICE_ID;
  doc["status"]      = status;
  doc["firmware_v"]  = "1.0.0";
  doc["battery_pct"] = 100;  // TODO: wire ADC pin for real battery level
  doc["is_tampered"] = false;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  Serial.printf("[Heartbeat] POST %s → HTTP %d\n", url.c_str(), code);
  http.end();
}

// ─── MAIN LOOP ───────────────────────────────────────────────────
void loop() {
  // Only process weight when collector app is connected via BLE
  if (!deviceConnected) {
    delay(1000);
    return;
  }

  Serial.println("[Scale] Collector connected — waiting for stable weight...");

  float weightGrams = getStableWeight();

  if (weightGrams < 0) {
    // Unstable — notify app so collector sees feedback
    if (pCharacteristic != nullptr) {
      pCharacteristic->setValue("UNSTABLE");
      pCharacteristic->notify();
    }
    delay(500);
    return;
  }

  if (weightGrams < 50) {
    // Ignore near-zero readings (empty platform, vibration noise)
    delay(500);
    return;
  }

  int weightInt = (int)round(weightGrams);
  Serial.printf("[Scale] Stable weight: %dg\n", weightInt);

  // Density fraud cap check (PRD Section 8.2)
  if (weightInt > MAX_WEIGHT_GRAMS) {
    Serial.printf("[Scale] WARNING: weight %dg exceeds density cap %dg — flagging\n",
                  weightInt, MAX_WEIGHT_GRAMS);
    // Still broadcast — backend will flag as AUDIT_REQUIRED
    // Collector app receives weight and backend handles the flag
  }

  // Broadcast to collector app via BLE
  broadcastWeightBLE(weightInt);

  // Tare scale after successful reading (ready for next citizen)
  delay(3000);
  scale.tare();
  Serial.println("[Scale] Tared. Ready for next citizen.");
}
