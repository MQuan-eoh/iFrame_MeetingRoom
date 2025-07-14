// Main entry point for the Meeting Room Dashboard (ES6 modules)
// Imports and initializes all modules, sets up event listeners, and wires up the app

import { initBackgroundManagement } from "./modules/background.js";
import { initFullscreenManagement } from "./modules/fullscreen.js";
import { showErrorModal } from "./modules/modal.js";
import {
  PeopleDetectionSystem,
  updatePeopleStatus,
} from "./modules/peopleDetection.js";
import * as schedule from "./modules/schedule.js";
import * as airConditioner from "./modules/airConditioner.js";
import { EraWidgetService } from "./services/eraWidget.js";
import {
  updateProgress,
  showProgressBar,
  hideProgressBar,
} from "./utils/domUtils.js";
import { getCurrentDate, getCurrentTime, padZero } from "./utils/dateUtils.js";

// Initialize background and fullscreen features
initBackgroundManagement();
initFullscreenManagement();

// Initialize ERA widget service
const eraWidgetService = new EraWidgetService();
// Example: eraWidgetService.init(widgetInstance, onConfig, onValues);

// Example: Set up event listeners for file upload, schedule, etc.
document.addEventListener("DOMContentLoaded", () => {
  // Example: initialize clock
  function updateClock() {
    const now = new Date();
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const time = `${hours}:${minutes}`;
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const dayName = days[now.getDay()];
    const date = padZero(now.getDate());
    const month = padZero(now.getMonth() + 1);
    const year = now.getFullYear();
    const dateStr = `${dayName}, ${date}/${month}/${year}`;
    const logoElement = document.querySelector(".logo");
    if (logoElement) {
      logoElement.innerHTML = `<div class="clock-container">${time}</div>`;
    }
    const currentDateElement = document.querySelector(".current-date");
    if (currentDateElement) {
      currentDateElement.style.fontSize = "15px";
      currentDateElement.style.color = "#ffffff";
      currentDateElement.style.fontWeight = "bold";
      currentDateElement.style.paddingRight = "25px";
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Example: set up upload button, schedule table, etc.
  // ... (add your event listeners and initialization logic here, using the imported modules)
});

// Export for testing or further integration
export {
  eraWidgetService,
  schedule,
  airConditioner,
  PeopleDetectionSystem,
  updatePeopleStatus,
  showErrorModal,
};
