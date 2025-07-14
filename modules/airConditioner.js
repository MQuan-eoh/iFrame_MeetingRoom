// Air Conditioner module for meeting room dashboard
// Encapsulates AC state, actions, and helpers for each room

import { normalizeRoomKey } from "../utils/roomUtils.js";

// State for each room's air conditioner
const acStates = {
  "Phòng họp lầu 3": {
    isOn: false,
    roomTemperatures: 20,
    minTemp: 16,
    maxTemp: 30,
  },
  "Phòng họp lầu 4": {
    isOn: false,
    roomTemperatures: 19,
    minTemp: 16,
    maxTemp: 30,
  },
};

// Map for ERA widget integration (if needed)
export const roomEraMap = {
  "Phòng họp lầu 3": "eRa",
  "Phòng họp lầu 4": "eRa2",
};

// Get AC state for a room
export function getACState(roomName) {
  const key = normalizeRoomKey(roomName);
  return acStates[key] || null;
}

// Set AC state for a room
export function setACState(roomName, state) {
  const key = normalizeRoomKey(roomName);
  acStates[key] = { ...acStates[key], ...state };
}

// Toggle AC on/off
export function toggleAC(roomName, isOn) {
  setACState(roomName, { isOn });
}

// Set temperature for a room
export function setACTemperature(roomName, temperature) {
  setACState(roomName, { roomTemperatures: temperature });
}

// Get all AC states (for debugging or UI)
export function getAllACStates() {
  return { ...acStates };
}

// Optionally, export helpers for ERA widget integration
export function getRoomEraSuffix(roomName) {
  return roomEraMap[roomName] || null;
}
