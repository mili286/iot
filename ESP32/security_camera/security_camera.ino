#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include "camera_pins.h"
#include <stdint.h>
#include <stddef.h>
#include <algorithm>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <HTTPClient.h>
#include <WebSocketsClient.h>
#include "SD_MMC.h"
#include "FS.h"
#include <time.h>

#define SDA 1                     
#define SCL 2                     

#define BUTTON_PIN 3  // Use GPIO 3 (RX) for button. NOTE: Serial RX will be disabled.

// SD Card Pins (ESP32-S3)
#define SD_MMC_CMD 38 
#define SD_MMC_CLK 39 
#define SD_MMC_D0  40 

#define PIR_PIN 14

// Constants
const char* ssid = "PAGE";
const char* password = "page2022#";

// Server configuration
const char* serverIP = "192.168.10.116"; 
const int serverPort = 3000;

uint8_t lcdAddress = 0x27;
LiquidCrystal_I2C lcd(0x27,16,2);

// Globals
WebSocketsClient webSocket;
bool isRecording = false;
bool wsConnected = false;
bool sdAvailable = false;
bool isSyncing = false;
unsigned long lastTriggerTime = 0;
const unsigned long TRIGGER_COOLDOWN = 30000; // 30 seconds cooldown
unsigned long lastFrameTime = 0;
const int frameInterval = 200; // ~5 fps
unsigned long chunkStartTime = 0;
const unsigned long CHUNK_DURATION = 5000; // 5 seconds
File currentFile;
String currentFileName = "";

void cameraSetup();
void streamVideo();
void triggerEvent(String type);
void uploadStoredFiles();
String getTimestamp();
void manageSDSpace();
void onWebsocketEvent(WStype_t type, uint8_t * payload, size_t length);

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(PIR_PIN, INPUT);
  
  Wire.begin(SDA, SCL);           
  
  if (!i2CAddrTest(lcdAddress)) {
    lcdAddress = 0x3F;
    if (!i2CAddrTest(lcdAddress)) {
      Serial.println("LCD not found!");
      lcdAddress = 0;
    }
  }
  
  if (lcdAddress != 0) {
    lcd = LiquidCrystal_I2C(lcdAddress, 16, 2);
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0,0);
    lcd.print("Initializing...");
  }   

  // Initialize SD Card
  SD_MMC.setPins(SD_MMC_CLK, SD_MMC_CMD, SD_MMC_D0);
  if (SD_MMC.begin("/sdcard", true, true, SDMMC_FREQ_DEFAULT, 5)) {
    Serial.println("SD Card Initialized");
    sdAvailable = true;
    SD_MMC.mkdir("/rec");
  } else {
    Serial.println("SD Card Failed");
  }

  setCpuFrequencyMhz(240);           
  WiFi.setTxPower(WIFI_POWER_19_5dBm); 
  WiFi.setSleep(false);              

  cameraSetup();

  Serial.println("Connecting WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");

  // Sync time
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    now = time(nullptr);
  }

  // Socket.io Setup (using WebSockets transport)
  // EIO=4 is for Socket.io v4
  webSocket.begin(serverIP, serverPort, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(onWebsocketEvent);
  webSocket.setReconnectInterval(5000);

  if (lcdAddress != 0) {
    lcd.clear();
    lcd.print("Ready");
    lcd.setCursor(0,1);
    lcd.print(WiFi.localIP());
  }
}

void loop() {
  webSocket.loop();
  handleButton();
  streamVideo();

  // If reconnected and not syncing, start sync
  if (wsConnected && !isSyncing && sdAvailable) {
    // uploadStoredFiles();
  }

  int pirState = digitalRead(PIR_PIN);
  if (pirState == HIGH) {
    triggerEvent("motion");
  }
}

void onWebsocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected!");
      wsConnected = false;
      if (lcdAddress != 0) {
        lcd.setCursor(15,0);
        lcd.print("X");
      }
      break;
    case WStype_CONNECTED:
      Serial.println("[WS] Connected!");
      // Send Socket.io connection packet
      webSocket.sendTXT("40");
      wsConnected = true;
      if (lcdAddress != 0) {
        lcd.setCursor(15,0);
        lcd.print("C");
      }
      break;
    case WStype_TEXT:
      // Serial.printf("[WS] Text: %s\n", payload);
      // Handle Socket.io ping (2)
      if (payload[0] == '2') {
        webSocket.sendTXT("3"); // Send pong (3)
      }
      break;
    case WStype_BIN:
      break;
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
  }
}

void handleButton() {
    static int lastState = HIGH;
    int currentState = digitalRead(BUTTON_PIN);

    if (lastState == HIGH && currentState == LOW) {
        Serial.println("Button Pressed");
        isRecording = !isRecording;
        
        // Trigger event via API
        triggerEvent("button");
        
        if (wsConnected) {
            if (isRecording) {
                webSocket.sendTXT("42[\"start-recording\"]");
            } else {
                webSocket.sendTXT("42[\"stop-recording\"]");
            }
        }

        if (lcdAddress != 0) {
            lcd.setCursor(0,0);
            lcd.print(isRecording ? "REC [●]      " : "Ready        ");
        }
        delay(500);
    }
    lastState = currentState;
}

void triggerEvent(String type) {
    unsigned long currentTime = millis();
    if (currentTime - lastTriggerTime < TRIGGER_COOLDOWN && lastTriggerTime != 0) {
        Serial.printf("[HTTP] Cooldown active. Skipping %s trigger.\n", type.c_str());
        return;
    }

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String url = "http://" + String(serverIP) + ":" + String(serverPort) + "/api/events/trigger";
        http.begin(url);
        http.addHeader("Content-Type", "application/json");

        String timestamp = getTimestamp();
        String jsonPayload = "{\"type\":\"" + type + "\",\"timestamp\":\"" + timestamp + "\"}";
        
        Serial.printf("[HTTP] Triggering event: %s\n", type.c_str());
        int httpResponseCode = http.POST(jsonPayload);

        if (httpResponseCode > 0) {
            Serial.printf("[HTTP] Response code: %d\n", httpResponseCode);
            lastTriggerTime = currentTime; // Update last trigger time on success
        } else {
            Serial.printf("[HTTP] Error occurred: %s\n", http.errorToString(httpResponseCode).c_str());
        }
        http.end();
    } else {
        Serial.println("WiFi Disconnected: Event not sent");
    }
}

void streamVideo() {
    if (millis() - lastFrameTime < frameInterval) return;
    lastFrameTime = millis();

    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) return;

    if (wsConnected) {
        // Stream over Socket.io (v4 binary protocol)
        // 1. Send placeholder message
        webSocket.sendTXT("451-[\"stream-data\",{\"_placeholder\":true,\"num\":0}]");
        // 2. Send the binary data
        webSocket.sendBIN(fb->buf, fb->len);
        
        if (currentFile) {
            currentFile.close();
            currentFileName = "";
        }
    } else if (sdAvailable) {
        // Fallback: Record to SD in 5s chunks
        if (currentFileName == "" || (millis() - chunkStartTime > CHUNK_DURATION)) {
            if (currentFile) currentFile.close();
            
            manageSDSpace();
            
            chunkStartTime = millis();
            currentFileName = "/rec/chunk_" + String(time(nullptr)) + ".mjpeg";
            currentFile = SD_MMC.open(currentFileName, FILE_WRITE);
            Serial.printf("Starting new chunk: %s\n", currentFileName.c_str());
        }
        
        if (currentFile) {
            currentFile.write(fb->buf, fb->len);
        }
    }

    esp_camera_fb_return(fb);
}

void manageSDSpace() {
    // Check space and delete oldest if > 90% full
    uint64_t total = SD_MMC.totalBytes();
    uint64_t used = SD_MMC.usedBytes();
    
    if (used > total * 0.9) {
        Serial.println("SD Card almost full, cleaning up...");
        File root = SD_MMC.open("/rec");
        String oldestFile = "";
        time_t oldestTime = 0xFFFFFFFF;
        
        File file = root.openNextFile();
        while (file) {
            String name = String(file.name());
            if (name.startsWith("/rec/chunk_")) {
                time_t t = name.substring(11, name.length() - 6).toInt();
                if (t < oldestTime) {
                    oldestTime = t;
                    oldestFile = name;
                }
            }
            file = root.openNextFile();
        }
        
        if (oldestFile != "") {
            Serial.printf("Deleting oldest chunk: %s\n", oldestFile.c_str());
            SD_MMC.remove(oldestFile);
        }
    }
}

void uploadStoredFiles() {
    isSyncing = true;
    File root = SD_MMC.open("/rec");
    File file = root.openNextFile();
    
    while (file) {
        if (!wsConnected) break; // Stop if lost connection again
        
        String filePath = String(file.name());
        if (filePath.endsWith(".mjpeg")) {
            Serial.printf("Syncing: %s\n", filePath.c_str());
            
            WiFiClient client;
            if (client.connect(serverIP, serverPort)) {
                String boundary = "----ESP32Boundary" + String(millis());
                // Remove "/rec/" or leading "/" if present to get clean filename
                String fileName = filePath;
                if (fileName.startsWith("/rec/")) fileName = fileName.substring(5);
                else if (fileName.startsWith("/")) fileName = fileName.substring(1);
                
                String header = "--" + boundary + "\r\n";
                header += "Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n";
                header += "Content-Type: video/x-motion-jpeg\r\n\r\n";
                String tail = "\r\n--" + boundary + "--\r\n";
                
                size_t fileSize = file.size();
                uint32_t totalLength = header.length() + fileSize + tail.length();
                
                client.printf("POST /api/upload/stream HTTP/1.1\r\n");
                client.printf("Host: %s:%d\r\n", serverIP, serverPort);
                client.printf("Content-Type: multipart/form-data; boundary=%s\r\n", boundary.c_str());
                client.printf("Content-Length: %d\r\n", totalLength);
                client.printf("Connection: close\r\n\r\n");
                
                client.print(header);
                
                uint8_t buffer[1024];
                while (file.available()) {
                    size_t bytesRead = file.read(buffer, sizeof(buffer));
                    client.write(buffer, bytesRead);
                }
                
                client.print(tail);
                
                // Read response
                unsigned long timeout = millis();
                bool success = false;
                while (client.connected() && millis() - timeout < 10000) {
                    if (client.available()) {
                        String line = client.readStringUntil('\n');
                        if (line.indexOf("200 OK") != -1 || line.indexOf("201 Created") != -1) {
                            success = true;
                            break;
                        }
                    }
                }
                
                if (success) {
                    Serial.println("Sync success, deleting file");
                    file.close();
                    SD_MMC.remove(filePath);
                } else {
                    Serial.println("Sync failed or timeout");
                    file.close();
                }
                client.stop();
            } else {
                Serial.println("Connection failed");
                file.close();
            }
        } else {
            file.close();
        }
        file = root.openNextFile();
    }
    isSyncing = false;
}

void cameraSetup() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;       
  config.frame_size = FRAMESIZE_QVGA;   
  config.pixel_format = PIXFORMAT_JPEG; 
  config.grab_mode = CAMERA_GRAB_LATEST; 
  
  if (psramFound()) {
    config.fb_location = CAMERA_FB_IN_PSRAM; 
    config.jpeg_quality = 10;              
    config.fb_count = 2;                   
  } else {
    config.fb_location = CAMERA_FB_IN_DRAM; 
    config.jpeg_quality = 12;              
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
      Serial.printf("Camera init failed with error 0x%x\n", err);
      return;
  }
  
  sensor_t * s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_QVGA); 
}

String getTimestamp() {
    time_t now = time(nullptr);
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    char buf[32];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buf);
}

bool i2CAddrTest(uint8_t addr) {
  Wire.beginTransmission(addr);
  return (Wire.endTransmission() == 0);
}
