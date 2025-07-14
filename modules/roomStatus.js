// Room status and meeting info update logic
import { getCurrentDate, getCurrentTime } from "../utils/dateUtils.js";
import { isTimeOverdue } from "../utils/timeUtils.js";
import { normalizeRoomName } from "../utils/roomUtils.js";

export function updateRoomStatus(data) {
  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();
  const todayMeetings = data.filter((meeting) => meeting.date === currentDate);
  const roomsToUpdate = ["Phòng họp lầu 4", "Phòng họp lầu 3"];
  roomsToUpdate.forEach((roomName) => {
    updateSingleRoomStatus(roomName, todayMeetings, currentTime);
  });
}

export function updateSingleRoomStatus(roomCode, meetings, currentTime) {
  const roomSections = document.querySelectorAll(".room-section");
  const roomSection = Array.from(roomSections).find((section) => {
    const roomElement = section.querySelector(".room-number");
    return (
      roomElement &&
      normalizeRoomName(roomElement.textContent) === normalizeRoomName(roomCode)
    );
  });
  if (!roomSection) return;
  const titleElement = roomSection.querySelector(".meeting-title");
  const startTimeElement = roomSection.querySelector(".start-time");
  const endTimeElement = roomSection.querySelector(".end-time");
  const statusIndicator = roomSection.querySelector(
    ".status-indicator .status-text"
  );
  const indicatorDot = roomSection.querySelector(
    ".status-indicator .indicator-dot"
  );
  const roomMeetings = meetings.filter(
    (meeting) =>
      normalizeRoomName(meeting.room) === normalizeRoomName(roomCode) &&
      !isTimeOverdue(meeting.endTime, currentTime)
  );
  const activeMeeting = roomMeetings.find(
    (meeting) =>
      isValidMeetingState(meeting, currentTime) &&
      !meeting.isEnded &&
      !meeting.forceEndedByUser
  );
  if (activeMeeting) {
    titleElement.innerHTML = `<span>Thông tin cuộc họp:</span> ${
      activeMeeting.content || activeMeeting.purpose
    }`;
    startTimeElement.innerHTML = `<span>Thời gian bắt đầu:</span> ${activeMeeting.startTime}`;
    endTimeElement.innerHTML = `<span>Thời gian kết thúc:</span> ${activeMeeting.endTime}`;
    statusIndicator.textContent = "Đang họp";
    indicatorDot.classList.remove("available");
    indicatorDot.classList.add("busy");
  } else {
    const upcomingMeeting = roomMeetings.find(
      (meeting) =>
        !meeting.isEnded &&
        !meeting.forceEndedByUser &&
        meeting.startTime > currentTime
    );
    if (upcomingMeeting) {
      titleElement.innerHTML = `<span>Thông tin cuộc họp sắp diễn ra:</span> ${
        upcomingMeeting.content || upcomingMeeting.purpose
      }`;
      startTimeElement.innerHTML = `<span>Thời gian bắt đầu:</span> ${upcomingMeeting.startTime}`;
      endTimeElement.innerHTML = `<span>Thời gian kết thúc:</span> ${upcomingMeeting.endTime}`;
      statusIndicator.textContent = "Sắp họp";
      indicatorDot.classList.remove("busy");
      indicatorDot.classList.add("available");
    } else {
      titleElement.innerHTML = `<span>Thông tin cuộc họp:</span> Trống`;
      startTimeElement.innerHTML = `<span>Thời gian bắt đầu:</span> --:--`;
      endTimeElement.innerHTML = `<span>Thời gian kết thúc:</span> --:--`;
      statusIndicator.textContent = "Trống";
      indicatorDot.classList.remove("busy");
      indicatorDot.classList.add("available");
    }
  }
}

// Meeting state validation (stub, to be implemented as needed)
export function isValidMeetingState(meeting, currentTime) {
  // Implement your logic here
  return true;
}
