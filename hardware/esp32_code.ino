#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "vivo 1807";
const char* password = "yondu123";

const char* serverName = "http://192.168.43.81:5000/api/data"; 

#define GAS_PIN 34
#define WATER_PIN 35

// Thresholds
float Gc = 200;
float Gw = 178;
float Wc = 70;
float Ww = 40;

String calculateRisk(float gas, float water) {
  if (gas >= Gc || water >= Wc) {
    return "CRITICAL";
  } 
  else if (gas >= Gw || water >= Ww) {
    return "WARNING";
  } 
  else {
    return "NORMAL";
  }
}

String getDecision(String risk) {
  if (risk == "CRITICAL") {
    return "Deploy Machine Immediately";
  } 
  else if (risk == "WARNING") {
    return "Schedule Cleaning";
  } 
  else {
    return "Monitor Only";
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
}

void loop() {

  int gasRaw = analogRead(GAS_PIN);
  int waterRaw = analogRead(WATER_PIN);

  float gas = map(gasRaw, 0, 4095, 0, 500);
  float water = map(waterRaw, 0, 4095, 0, 100);

  String risk = calculateRisk(gas, water);
  String decision = getDecision(risk);

  Serial.println("------ SENSOR DATA ------");
  Serial.print("Gas: "); Serial.println(gas);
  Serial.print("Water: "); Serial.println(water);
  Serial.print("Risk: "); Serial.println(risk);
  Serial.print("Decision: "); Serial.println(decision);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"sewer_id\":\"S1\",";
    jsonData += "\"gas_level\":" + String(gas) + ",";
    jsonData += "\"water_level\":" + String(water) + ",";
    jsonData += "\"risk\":\"" + risk + "\",";
    jsonData += "\"decision\":\"" + decision + "\"";
    jsonData += "}";

    int responseCode = http.POST(jsonData);

    Serial.print("HTTP Response: ");
    Serial.println(responseCode);

    http.end();
  }

  delay(5000);
}
