#define ERA_DEBUG
#define ERA_SERIAL Serial
#define ERA_LOCATION_VN
// #define ERA_LOCATION_SG
// You should get Auth Token in the ERa App or ERa Dashboard
#define ERA_AUTH_TOKEN "ca614c19-2a5c-4a12-9cd8-895cf754d84e"
#define LEDPIN 6
#define LEDPIN1 7
#include <Arduino.h>
#include <ERa.hpp>    

const char ssid[] = "eoh.io";
const char pass[] = "Eoh@2020";

ERA_CONNECTED()
{
  ERA_LOG("ERa", "ERa connected!");
}

/* This function will run every time ERa is disconnected */
ERA_DISCONNECTED()
{
  ERA_LOG("ERa", "ERa disconnected!");
}

ERA_WRITE(V30) {
    /* Get value from Virtual Pin 0 and write LED */
    uint8_t value = param.getInt();
    if(value == 1)
    {
      digitalWrite(LEDPIN,HIGH);
      digitalWrite(LEDPIN1,LOW);
    }else{
      digitalWrite(LEDPIN1,HIGH);
      digitalWrite(LEDPIN,LOW);
    }

}

/* This function send uptime every second to Virtual Pin 1 */
void timerEvent()
{
  ERA_LOG("Timer", "Uptime: %d", ERaMillis() / 1000L);
  // Tạo giá trị ngẫu nhiên cho dòng điện từ 0.5 đến 10 Amps
  float current = random(5, 101) / 10.0;
  ERa.virtualWrite(V15, current);
  // Tạo giá trị ngẫu nhiên cho điện áp từ 220 đến 240 Volts
  float voltage = random(2200, 2401) / 10.0;
  ERa.virtualWrite(V16, voltage);
  // Tính công suất tiêu thụ (P = V * I)
  float power_consumption = current * voltage;
  ERa.virtualWrite(V18, power_consumption);
  
  // Thêm giá trị nhiệt độ ngẫu nhiên (20°C đến 35°C)
  float temperature = random(200, 351) / 10.0;
  ERa.virtualWrite(V9, temperature);
  
  // Thêm giá trị độ ẩm ngẫu nhiên (40% đến 80%)
  float humidity = random(40, 81);
  ERa.virtualWrite(V10, humidity);
  
  int airValue =random(16,30);
  ERa.virtualWrite(V29, airValue);
  int airValue2 =random(25,30);
  ERa.virtualWrite(V31, airValue2);

    int airValue3 =random(16,20);
  ERa.virtualWrite(V32, airValue3);
  // In ra các giá trị lên Serial Monitor
  Serial.printf("Current: %.2f A, Voltage: %.2f V, Power Consumption: %.2f W\n", current, voltage, power_consumption);
  Serial.printf("Temperature: %.1f °C, Humidity: %.0f %%\n", temperature, humidity);
  Serial.printf("Air Value: %.1d ",airValue);
  delay(2000);
}

void setup()
{
  /* Setup debug console */
#if defined(ERA_DEBUG)
  Serial.begin(115200);
#endif
  ERa.setScanWiFi(true);
  /* Initializing the ERa library. */
  ERa.begin(ssid, pass);
  /* Setup timer called function every second */
  ERa.addInterval(1000L, timerEvent);
  pinMode(LEDPIN,OUTPUT);
  pinMode(LEDPIN1,OUTPUT);
  digitalWrite(LEDPIN,LOW);
  digitalWrite(LEDPIN1,LOW);
}

void loop()
{
  ERa.run();
}