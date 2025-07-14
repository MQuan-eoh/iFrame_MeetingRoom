// Utility for time range checking
import { timeToMinutes } from "../utils/dateUtils.js";

export function isTimeInRange(currentTime, startTime, endTime) {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(`${startTime}:00`);
  const end = timeToMinutes(`${endTime}:00`);
  return current >= start && current <= end;
}

export function isTimeOverdue(endTime, currentTime) {
  const endTimeParts = endTime.split(":");
  const endTimeWithSeconds = `${endTimeParts[0]}:${endTimeParts[1]}:00`;
  return timeToMinutes(currentTime) > timeToMinutes(endTimeWithSeconds);
}
