// Schedule/meeting logic for meeting room dashboard
// Handles Excel file processing, meeting validation, and schedule table updates

import {
  formatTime,
  formatDayOfWeek,
  formatDate,
  formatDuration,
  getCurrentDate,
  getCurrentTime,
  timeToMinutes,
} from "../utils/dateUtils.js";
import { formatRoomName, normalizeRoomName } from "../utils/roomUtils.js";
import { updateProgress } from "../utils/domUtils.js";

// Determines the purpose of a meeting from content
export function determinePurpose(content) {
  if (!content) return "Khác";
  const contentLower = String(content).toLowerCase();
  if (contentLower.includes("họp")) return "Họp";
  if (contentLower.includes("đào tạo")) return "Đào tạo";
  if (contentLower.includes("phỏng vấn") || contentLower.includes("pv"))
    return "Phỏng vấn";
  return "Khác";
}

// Process Excel file and return meetings array
export function processExcelFile(file, XLSX, showErrorModal, validateMeetings) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
          dateNF: "dd/mm/yyyy",
        });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(firstSheet, {
          raw: true,
          defval: "",
          header: 1,
        });
        // ...existing code for header detection and column indices...
        const headerRowIndex = rawData.findIndex((row) =>
          row.some((cell) =>
            String(cell)
              .toLowerCase()
              .match(/giờ|thời gian|start|end|duration/i)
          )
        );
        if (headerRowIndex === -1)
          return reject(new Error("Cannot find header row"));
        const headers = rawData[headerRowIndex].map((h) =>
          String(h).toLowerCase().trim()
        );
        const columnIndices = {
          startTime: headers.findIndex(
            (h) =>
              h.includes("giờ bắt đầu") ||
              h.includes("start") ||
              h.includes("bắt đầu") ||
              h === "start time"
          ),
          endTime: headers.findIndex(
            (h) =>
              h.includes("giờ kết thúc") ||
              h.includes("end") ||
              h.includes("kết thúc") ||
              h === "end time"
          ),
          duration: headers.findIndex(
            (h) =>
              h.includes("thời gian sử dụng") ||
              h.includes("duration") ||
              h.includes("thời gian") ||
              h === "duration time"
          ),
        };
        const meetings = [];
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row.some((cell) => cell)) continue;
          const startTimeValue = row[columnIndices.startTime] || row[3];
          const endTimeValue = row[columnIndices.endTime] || row[4];
          const durationValue = row[columnIndices.duration] || row[5];
          const meeting = {
            id: meetings.length + 1,
            date: formatDate(row[0]),
            dayOfWeek: formatDayOfWeek(row[1]),
            room: formatRoomName(row[2]),
            startTime: formatTime(startTimeValue),
            endTime: formatTime(endTimeValue),
            duration: formatDuration(durationValue),
            content: row[7] || "",
            purpose: determinePurpose(row[7]),
          };
          meetings.push(meeting);
        }
        const conflicts = await validateMeetings(meetings);
        if (conflicts.length > 0) {
          let errorMessage = "Phát hiện xung đột trong lịch họp:\n\n";
          conflicts.forEach((conflict) => {
            errorMessage += `${conflict.message}\n\n`;
          });
          showErrorModal(errorMessage);
          reject(new Error("CONFLICT_ERROR"));
          return;
        }
        resolve(meetings);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Validate meetings for time conflicts
export async function validateMeetings(meetings) {
  const conflicts = [];
  const processedMeetings = new Set();
  for (let i = 0; i < meetings.length; i++) {
    const currentMeeting = meetings[i];
    for (let j = 0; j < meetings.length; j++) {
      if (i === j) continue;
      const otherMeeting = meetings[j];
      if (
        currentMeeting.date === otherMeeting.date &&
        normalizeRoomName(currentMeeting.room) ===
          normalizeRoomName(otherMeeting.room)
      ) {
        if (checkTimeConflict(currentMeeting, otherMeeting)) {
          const conflictKey = [i, j].sort().join("_");
          if (!processedMeetings.has(conflictKey)) {
            conflicts.push({
              meeting1: currentMeeting,
              meeting2: otherMeeting,
              message:
                `Xung đột lịch họp tại phòng ${currentMeeting.room} ngày ${currentMeeting.date}:\n` +
                `- Cuộc họp 1: "${
                  currentMeeting.content || currentMeeting.purpose
                }" (${currentMeeting.startTime} - ${
                  currentMeeting.endTime
                })\n` +
                `- Cuộc họp 2: "${
                  otherMeeting.content || otherMeeting.purpose
                }" (${otherMeeting.startTime} - ${otherMeeting.endTime})`,
            });
            processedMeetings.add(conflictKey);
          }
        }
      }
    }
  }
  return conflicts;
}

// Check if two meetings overlap
export function checkTimeConflict(meeting1, meeting2) {
  const start1 = timeToMinutes(meeting1.startTime);
  const end1 = timeToMinutes(meeting1.endTime);
  const start2 = timeToMinutes(meeting2.startTime);
  const end2 = timeToMinutes(meeting2.endTime);
  return start1 < end2 && start2 < end1;
}

// Update the schedule table in the DOM
export function updateScheduleTable(data) {
  const tableBody = document.querySelector(".schedule-table");
  const headerRow = tableBody.querySelector(".table-header");
  updateProgress(40, "Đang đồng bộ hóa dữ liệu...");
  Array.from(tableBody.children)
    .filter((child) => child !== headerRow)
    .forEach((child) => child.remove());
  data.forEach((meeting) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.setAttribute("role", "row");
    updateProgress(70, "Đang cập nhật dữ liệu...");
    row.innerHTML = `
      <div role="cell">${meeting.id}</div>
      <div role="cell">${meeting.date}</div>
      <div role="cell">${meeting.dayOfWeek}</div>
      <div role="cell">${meeting.room}</div>
      <div role="cell">${meeting.startTime}</div>
      <div role="cell">${meeting.endTime}</div>
      <div role="cell">${meeting.duration}</div>
      <div role="cell">${meeting.purpose}</div>
      <div role="cell">${meeting.content}</div>
    `;
    tableBody.appendChild(row);
    updateProgress(100, "Cập nhật thành công");
  });
}
