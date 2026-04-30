# Sewer-Monitoring-System
IoT-based sewer monitoring and decision support system using ESP32

## Overview
This project is an IoT-based sewer monitoring system built using ESP32 to detect gas accumulation and water level rise inside a sewer pipeline.
The system continuously monitors conditions and classifies them into:
- NORMAL
- WARNING
- CRITICAL
It sends real-time data to a backend server for monitoring and decision-making.

## Objective
1. Detect gas buildup inside sewer pipelines
2. Monitor rising water levels
3. Classify risk conditions in real-time
4. Send data to a dashboard via WiFi
5. Reduce need for manual sewer inspection

## System Architecture
Sensors (MQ-135 + Water Sensor)
        ↓
ESP32 Microcontroller
        ↓
Decision Logic (Threshold-Based)
        ↓
WiFi (HTTP POST)
        ↓
Backend / Dashboard

##  Components Used
A. Hardware
1. ESP32 Dev Module
2. MQ-135 Gas Sensor
3. Water Level Sensor
4. Breadboard & Jumper Wires
5. PVC / Transparent Pipe Model
6. USB Data Cable

B. Software
- Arduino IDE
- Flask (Python)
- SQLite Database

## Working Principle
A. Gas Detection
1. MQ-135 detects gases from decomposition (cow dung in demo)
2. Outputs analog values (0–4095)
3. Used for relative gas level monitoring

B. Water Level Detection
- Water sensor detects liquid presence and level
- Output increases as water level rises

## Decision Logic
NORMAL:
  Gas < 2600 AND Water < 800

WARNING:
  Gas ≥ 2600 OR Water ≥ 800

CRITICAL:
  Gas ≥ 3000 OR Water ≥ 1800

## Data Transmission
ESP32 sends JSON data to backend:
{
  "sewer_id": "S1",
  "gas_level": 2750,
  "water_level": 900,
  "risk": "WARNING",
  "decision": "Schedule Cleaning"
}

## Physical Model
- Pipe-based sewer structure
- MQ-135 placed in upper gas region
- Water sensor placed at bottom
- Cow dung + water used to simulate sewer conditions

## Features
- Real-time monitoring
- Wireless data transmission
- Automated risk classification
- Low-cost implementation
- Visual demo of sewer conditions

## Limitations
- MQ-135 is not calibrated for exact gas ppm
- Water sensor readings are not perfectly linear
- Thresholds are environment-dependent
- System uses rule-based logic (not predictive)

## Future Scope
- Gas calibration (ppm-based detection)
- Machine learning for prediction
- Mobile/web dashboard improvements
- Multi-sensor integration
- Industrial-grade design

## Team
Suraj Kamble
Sharvari Kargutkar
Kushal Jamnekar
