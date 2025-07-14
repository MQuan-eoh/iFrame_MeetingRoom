// ERA Widget integration service for meeting room dashboard
// Encapsulates all logic for interacting with the ERA IoT widget and sensors

export class EraWidgetService {
  constructor() {
    this.latestValues = {};
    this.roomTemperatures = {
      "Phòng họp lầu 3": 20,
      "Phòng họp lầu 4": 20,
    };
    this.widget = null;
    this.config = {};
    this.valueAir1 = null;
    this.valueAir2 = null;
  }

  init(widgetInstance, onConfig, onValues) {
    this.widget = widgetInstance;
    this.widget.init({
      onConfiguration: (configuration) => {
        this.config = configuration;
        if (onConfig) onConfig(configuration);
      },
      onValues: (values) => {
        this.latestValues = values;
        if (onValues) onValues(values);
      },
    });
  }

  getRoomPowerStats(roomKey) {
    const stats = {
      "phòng họp lầu 3": {
        temp: this.latestValues[this.config.configTemp?.id]?.value || 0,
        humi: this.latestValues[this.config.configHumi?.id]?.value || 0,
      },
      "phòng họp lầu 4": {
        temp: this.latestValues[this.config.configTemp2?.id]?.value || 0,
        humi: this.latestValues[this.config.configHumi2?.id]?.value || 0,
      },
    };
    return stats[roomKey.toLowerCase()] || { temp: 0, humi: 0 };
  }

  // Add more ERA-related methods as needed
}
