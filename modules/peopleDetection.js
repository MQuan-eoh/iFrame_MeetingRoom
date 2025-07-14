// People detection module for meeting room dashboard
// Encapsulates people detection state and helpers

export const PeopleDetectionSystem = {
  states: {
    "Phòng họp lầu 3": { isEmpty: true },
    "Phòng họp lầu 4": { isEmpty: true },
  },
  config: {
    "Phòng họp lầu 3": { sensorId: 4 },
    "Phòng họp lầu 4": { sensorId: 16 },
  },
};

export function updatePeopleStatus(room, value) {
  if (PeopleDetectionSystem.states[room]) {
    PeopleDetectionSystem.states[room].isEmpty = !value;
  }
}
