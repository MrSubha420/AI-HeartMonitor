#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "SparkFun_MAX3010x.h"
#include <Adafruit_MLX90614.h>
#include <Adafruit_BMP085.h>
#include <Adafruit_MPU6050.h>

// ======================
// Hardware Configuration
// ======================

// LCD Display (I2C)
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Address 0x27, 16 columns, 2 rows

// Sensor Objects
SparkFun_MAX30105 max30102;
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
Adafruit_BMP085 bmp;
Adafruit_MPU6050 mpu;

// ======================
// Network Configuration
// ======================

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ======================
// Firebase Configuration
// ======================

#define FIREBASE_HOST "your-project-id.firebaseio.com"
#define FIREBASE_AUTH "your-database-secret"
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ======================
// Pin Definitions
// ======================

#define ECG_SENSOR_PIN 34   // Analog input for AD8232
#define LO_PLUS_PIN 12      // Lead-off detection+
#define LO_MINUS_PIN 14     // Lead-off detection-

// ======================
// Global Variables
// ======================

enum SystemState {
  STATE_IDLE,
  STATE_MAX30102,
  STATE_AD8232,
  STATE_MLX90614,
  STATE_BMP180,
  STATE_MPU6050
};

volatile SystemState currentState = STATE_IDLE;
unsigned long stateStartTime = 0;
const unsigned long STATE_DURATION = 500; // 500ms per sensor
char macAddress[18]; // MAC address storage

// ======================
// Setup Function
// ======================

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  while (!Serial); // Wait for serial port

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  // Display MAC address
  displayMACAddress();
  delay(2000);
  lcd.clear();

  // Initialize ECG pins
  pinMode(LO_PLUS_PIN, INPUT);
  pinMode(LO_MINUS_PIN, INPUT);

  // Initialize I2C sensors
  initializeI2CDevices();

  // Connect to WiFi
  connectToWiFi();

  // Initialize Firebase
  Firebase.begin(&config, &auth);
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
}

// ======================
// Main Loop
// ======================

void loop() {
  checkFirebaseState();
  processCurrentState();
}

// ======================
// Core Functions
// ======================

void checkFirebaseState() {
  if (Firebase.RTDB.getInt(&fbdo, "/state")) {
    if (fbdo.dataType() == "int") {
      int newState = fbdo.intData();
      
      if (newState != currentState && newState >= STATE_IDLE && newState <= STATE_MPU6050) {
        currentState = static_cast<SystemState>(newState);
        stateStartTime = millis();
        updateLCDDisplay();
      }
    }
  }
}

void processCurrentState() {
  if (currentState != STATE_IDLE && (millis() - stateStartTime > STATE_DURATION)) {
    resetSystem();
    return;
  }

  switch(currentState) {
    case STATE_MAX30102:
      readMAX30102();
      break;
    case STATE_AD8232:
      readAD8232();
      break;
    case STATE_MLX90614:
      readMLX90614();
      break;
    case STATE_BMP180:
      readBMP180();
      break;
    case STATE_MPU6050:
      readMPU6050();
      break;
    default:
      // IDLE state - do nothing
      break;
  }
}

// ======================
// Sensor Read Functions
// ======================

void readMAX30102() {
  static uint32_t lastSample = 0;
  if (millis() - lastSample < 10) return; // 100Hz sampling
  
  // Read sensor values
  int heartRate = max30102.getHeartRate();
  int spo2 = max30102.getSpO2();
  
  // Send to Firebase
  if (Firebase.RTDB.setInt(&fbdo, "/sensors/heart_rate", heartRate) &&
      Firebase.RTDB.setInt(&fbdo, "/sensors/spo2", spo2)) {
    Serial.println("MAX30102 data sent");
  }
  
  lastSample = millis();
}

void readAD8232() {
  int ecgValue = analogRead(ECG_SENSOR_PIN);
  
  // Check lead-off detection
  bool leadOff = (digitalRead(LO_PLUS_PIN) || digitalRead(LO_MINUS_PIN));
  
  if (!leadOff) {
    Firebase.RTDB.setInt(&fbdo, "/sensors/ecg", ecgValue);
  }
  delay(10); // Maintain 100Hz sampling
}

void readMLX90614() {
  float objectTemp = mlx.readObjectTempC();
  Firebase.RTDB.setFloat(&fbdo, "/sensors/temperature", objectTemp);
}

void readBMP180() {
  float pressure = bmp.readPressure() / 100.0; // Convert to hPa
  Firebase.RTDB.setFloat(&fbdo, "/sensors/pressure", pressure);
}

void readMPU6050() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  Firebase.RTDB.setFloat(&fbdo, "/sensors/accelX", a.acceleration.x);
  Firebase.RTDB.setFloat(&fbdo, "/sensors/accelY", a.acceleration.y);
  Firebase.RTDB.setFloat(&fbdo, "/sensors/accelZ", a.acceleration.z);
}

// ======================
// System Functions
// ======================

void initializeI2CDevices() {
  Wire.begin();

  // Initialize MAX30102
  if (!max30102.begin(Wire, I2C_SPEED_FAST)) {
    lcdError("MAX30102 Error");
  }
  max30102.setup(60, 4, 2); // Sample rate = 60, pulse width = 411μs, LED current = 2mA

  // Initialize MLX90614
  if (!mlx.begin()) {
    lcdError("MLX90614 Error");
  }

  // Initialize BMP180
  if (!bmp.begin()) {
    lcdError("BMP180 Error");
  }

  // Initialize MPU6050
  if (!mpu.begin()) {
    lcdError("MPU6050 Error");
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
}

void connectToWiFi() {
  lcd.print("Connecting WiFi");
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
    delay(500);
    lcd.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    lcd.clear();
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    delay(2000);
    lcd.clear();
  } else {
    lcdError("WiFi Failed");
  }
}

void displayMACAddress() {
  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(macAddress, sizeof(macAddress), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  lcd.print("MAC Address:");
  lcd.setCursor(0, 1);
  lcd.print(macAddress);
}

void updateLCDDisplay() {
  lcd.clear();
  lcd.print("Active Sensor:");
  lcd.setCursor(0, 1);
  
  switch(currentState) {
    case STATE_MAX30102: lcd.print("Pulse & SpO2"); break;
    case STATE_AD8232: lcd.print("ECG"); break;
    case STATE_MLX90614: lcd.print("Temperature"); break;
    case STATE_BMP180: lcd.print("Pressure"); break;
    case STATE_MPU6050: lcd.print("Accelerometer"); break;
    default: lcd.print("Ready"); break;
  }
}

void resetSystem() {
  currentState = STATE_IDLE;
  Firebase.RTDB.setInt(&fbdo, "/state", 0);
  updateLCDDisplay();
}

// ======================
// Error Handling
// ======================

void lcdError(const char* message) {
  lcd.clear();
  lcd.print("ERROR:");
  lcd.setCursor(0, 1);
  lcd.print(message);
  while(true) {
    delay(1000);
    lcd.noBacklight();
    delay(1000);
    lcd.backlight();
  }
}

// ======================
// Utility Functions
// ======================

void printSerialData() {
  Serial.print("MAC: ");
  Serial.println(macAddress);
  Serial.print("WiFi Status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.print("Firebase: ");
  Serial.println(Firebase.ready() ? "Ready" : "Not Ready");
}