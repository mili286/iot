#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include "camera_pins.h"
#include <stdint.h>
#include <stddef.h>
#include <algorithm>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include "SD_MMC.h" // Use SD_MMC for faster writes (1-bit mode)
#include "FS.h"
#include <HTTPClient.h>

#define SDA 1                     
#define SCL 2                     

#define BUTTON_PIN 3  // Use GPIO 3 (RX) for button. NOTE: Serial RX will be disabled.

#define SD_MMC_CMD 38 
#define SD_MMC_CLK 39 
#define SD_MMC_D0  40 

// Constants
const char* ssid = "Marko";
const char* password = "87654321";

// Video server configuration
const char* serverIP = "192.168.0.108"; 
const int serverPort = 8080;
const int httpPort = 8000; // FastAPI port

uint8_t lcdAddress = 0x27;
LiquidCrystal_I2C lcd(0x27,16,2);

// Globals
WiFiClient client;
bool isRecording = false;
bool sdInitialized = false;
unsigned long recordingStartTime = 0;
int currentChunkIndex = 0;
const int MAX_CHUNKS = 3;
const unsigned long CHUNK_DURATION = 10000; // 10 seconds per chunk
String chunkFiles[MAX_CHUNKS] = {"/chunk_0.mjpeg", "/chunk_1.mjpeg", "/chunk_2.mjpeg"};
File currentFile;

void cameraSetup();
void connectToServer();
void streamVideo();
void startRecording();
void stopRecording();
void handleButton();
void uploadChunks();

void setup() {
  // Start Serial port
  Serial.begin(115200);

  pinMode(BUTTON_PIN, INPUT_PULLUP); // Button to GND

  Wire.begin(SDA, SCL);           
  
  // Test for common I2C LCD addresses
  if (!i2CAddrTest(lcdAddress)) {
    lcdAddress = 0x3F;
    if (!i2CAddrTest(lcdAddress)) {
      Serial.println("LCD not found at common addresses!");
      lcdAddress = 0;
    }
  }
  
  if (lcdAddress != 0) {
    lcd = LiquidCrystal_I2C(lcdAddress, 16, 2);
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0,0);
    lcd.print("Init...");
  }   

  // Initialize SD Card
  SD_MMC.setPins(SD_MMC_CLK, SD_MMC_CMD, SD_MMC_D0);
  if (!SD_MMC.begin("/sdcard", true, true, SDMMC_FREQ_DEFAULT, 5)) {
    Serial.println("Card Mount Failed");
    if (lcdAddress != 0) {
      lcd.setCursor(0,1);
      lcd.print("SD Fail");
    }
  } else {
    Serial.println("SD Card Initialized");
    
    uint8_t cardType = SD_MMC.cardType();
    if(cardType == CARD_NONE){
        Serial.println("No SD_MMC card attached");
        sdInitialized = false;
    } else {
        Serial.print("SD_MMC Card Type: ");
        if(cardType == CARD_MMC) Serial.println("MMC"); 
        else if(cardType == CARD_SD) Serial.println("SDSC"); 
        else if(cardType == CARD_SDHC) Serial.println("SDHC"); 
        else Serial.println("UNKNOWN"); 
        
        uint64_t cardSize = SD_MMC.cardSize() / (1024 * 1024);
        Serial.printf("SD_MMC Card Size: %lluMB\n", cardSize);
        sdInitialized = true;
    }
  }

  setCpuFrequencyMhz(240);           
  WiFi.setTxPower(WIFI_POWER_19_5dBm); 
  WiFi.setSleep(false);              

  cameraSetup();

  // Connect to access point
  Serial.println("Connecting");
  if (lcdAddress != 0) {
    lcd.setCursor(0,0);
    lcd.print("Connecting WiFi");
  }
  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED ) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  if (lcdAddress != 0) {
    lcd.setCursor(0,0);
    lcd.print("WiFi OK");
    lcd.setCursor(0,1);
    lcd.print(WiFi.localIP());
  }

  connectToServer();
}

void loop() {
  handleButton();
  streamVideo();
}

void connectToServer() {
  if (lcdAddress != 0) {
    lcd.setCursor(0,0);
    lcd.print("Connecting Svr");
  }
  
  while (!client.connect(serverIP, serverPort)) {
    Serial.println("Connection to server failed, retrying...");
    delay(2000);
  }
  
  Serial.println("Connected to video server!");
  
  if (lcdAddress != 0) {
    lcd.setCursor(0,0);
    lcd.print("Streaming...    ");
    lcd.setCursor(0,1);
    lcd.print("Ready           ");
  }
}

void handleButton() {
    static int lastState = HIGH;
    int currentState = digitalRead(BUTTON_PIN);

    Serial.println(currentState); 
    
    if (lastState == HIGH && currentState == LOW) {
        // Button pressed
        if (!isRecording) {
            startRecording();
            // Notify server of manual start (optional, via command channel)
            client.print("EVENT:START\n"); 
        } else {
            stopRecording();
        }
        delay(500); // Debounce
    }
    lastState = currentState;
}

void startRecording() {
    Serial.println("Entered funtion!");
    if (!sdInitialized) return;
    
    Serial.println("Start Recording");
    isRecording = true;
    recordingStartTime = millis();
    currentChunkIndex = 0;
    
    // Open first chunk
    SD_MMC.remove(chunkFiles[0]);
    currentFile = SD_MMC.open(chunkFiles[0], FILE_WRITE);
    
    if (lcdAddress != 0) {
        lcd.setCursor(0,1);
        lcd.print("REC [●]         ");
    }
}

void stopRecording() {
    if (!isRecording) return;
    
    Serial.println("Stop Recording");
    isRecording = false;
    if (currentFile) currentFile.close();
    
    if (lcdAddress != 0) {
        lcd.setCursor(0,1);
        lcd.print("Uploading...    ");
    }
    
    // Upload files
    uploadChunks();
    
    if (lcdAddress != 0) {
        lcd.setCursor(0,1);
        lcd.print("Ready           ");
    }
}

void uploadChunks() {
    // Pause streaming is implicit because we are in main loop
    // But we need to make sure we don't block too long or watchdog triggers
    
    HTTPClient http;
    // Upload all valid chunks
    // Simple approach: Upload chunk 0, 1, 2...
    // In a real rolling buffer, we'd order them by time. 
    // Here we just upload what we have.
    
    for (int i = 0; i < MAX_CHUNKS; i++) {
        if (SD_MMC.exists(chunkFiles[i])) {
            Serial.printf("Uploading %s\n", chunkFiles[i].c_str());
            
            http.begin("http://" + String(serverIP) + ":" + String(httpPort) + "/upload");
            
            File file = SD_MMC.open(chunkFiles[i]);
            if (file) {
                // Manually construct multipart (simplified: just send raw body or use library if available)
                // HTTPClient supports sending stream
                http.addHeader("Content-Type", "video/x-motion-jpeg");
                http.addHeader("X-Filename", chunkFiles[i].substring(1)); // Remove leading slash
                
                int httpResponseCode = http.sendRequest("POST", &file, file.size());
                
                if (httpResponseCode > 0) {
                    Serial.printf("Response: %d\n", httpResponseCode);
                } else {
                    Serial.printf("Error: %s\n", http.errorToString(httpResponseCode).c_str());
                }
                file.close();
            }
            http.end();
        }
    }
}

void streamVideo() {
  if (!client.connected()) {
    connectToServer();
    return;
  }
  
  // Check for commands
  if (client.available()) {
      String line = client.readStringUntil('\n');
      line.trim();
      if (line == "CMD:START") {
          startRecording();
      } else if (line == "CMD:STOP") {
          stopRecording();
      }
  }

  camera_fb_t *fb = esp_camera_fb_get();
  if (fb != NULL) {
    if (fb->len > 100000) { 
      esp_camera_fb_return(fb);
      return;
    }
    
    // Send to Server
    uint32_t frame_size = fb->len;
    client.write((uint8_t*)&frame_size, 4);
    
    size_t bytes_sent = 0;
    while (bytes_sent < fb->len) {
      size_t chunk_size = std::min((size_t)1460, fb->len - bytes_sent); 
      size_t sent = client.write((uint8_t*)fb->buf + bytes_sent, chunk_size);
      if (sent == 0) break;
      bytes_sent += sent;
    }
    
    // Record to SD
    if (isRecording && sdInitialized && currentFile) {
        // Write frame to file (simple append)
        currentFile.write(fb->buf, fb->len);
        
        // Rolling chunk logic
        if (millis() - recordingStartTime > CHUNK_DURATION) {
            currentFile.close();
            currentChunkIndex = (currentChunkIndex + 1) % MAX_CHUNKS;
            
            // Overwrite next chunk
            SD_MMC.remove(chunkFiles[currentChunkIndex]);
            currentFile = SD_MMC.open(chunkFiles[currentChunkIndex], FILE_WRITE);
            
            recordingStartTime = millis();
        }
    }
    
    esp_camera_fb_return(fb);
  }
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
  config.fb_location = CAMERA_FB_IN_PSRAM; 
  config.jpeg_quality = 10;              
  config.fb_count = 2;                   

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
      Serial.printf("Camera init failed with error 0x%x", err);
      return;
  }
  
  sensor_t * s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_QVGA); 
}

bool i2CAddrTest(uint8_t addr) {
  Wire.beginTransmission(addr);
  uint8_t error = Wire.endTransmission();
  return (error == 0);
}
