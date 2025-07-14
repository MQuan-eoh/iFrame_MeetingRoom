// Utility for file change detection and cache refresh
import { processExcelFile } from "../modules/schedule.js";
import { updateScheduleTable } from "../modules/schedule.js";
import { updateRoomStatus } from "../modules/roomStatus.js";
import {
  showProgressBar,
  updateProgress,
  hideProgressBar,
} from "../utils/domUtils.js";

let fileHandle = null;
let lastFileData = null;

export async function checkFileChanges(XLSX) {
  if (!fileHandle) return;
  try {
    const file = await fileHandle.getFile();
    const fileData = await file.text();
    if (lastFileData === null) {
      lastFileData = fileData;
      return;
    }
    const existingCache = JSON.parse(localStorage.getItem("fileCache")) || {
      data: [],
    };
    const endedMeetings = existingCache.data.filter(
      (meeting) => meeting.isEnded && meeting.forceEndedByUser
    );
    if (fileData !== lastFileData) {
      const newData = await processExcelFile(file, XLSX);
      showProgressBar();
      updateProgress(0, "Đang đọc dữ liệu từ file...");
      const mergedData = newData.map((meeting) => {
        updateProgress(30, "Đang phân tích dữ liệu...");
        const endedMeeting = endedMeetings.find(
          (ended) =>
            ended.id === meeting.id &&
            ended.room === meeting.room &&
            ended.date === meeting.date
        );
        if (endedMeeting) {
          return endedMeeting;
        }
        return meeting;
      });
      updateProgress(60, "Đang hợp nhất với dữ liệu hiện tại...");
      const today = new Date();
      const todayMeetings = mergedData.filter((meeting) => {
        const meetingDate = new Date(
          meeting.date.split("/").reverse().join("-")
        );
        return meetingDate.toDateString() === today.toDateString();
      });
      updateProgress(75, "Đang cập nhật lịch trình...");
      updateScheduleTable(todayMeetings);
      updateRoomStatus(todayMeetings);
      localStorage.setItem(
        "fileCache",
        JSON.stringify({ data: mergedData, lastModified: new Date().getTime() })
      );
      updateProgress(95, "Đang lưu bộ nhớ đệm...");
      lastFileData = fileData;
      updateProgress(100, "Cập nhật thành công!");
      setTimeout(hideProgressBar, 1000);
    } else {
      const today = new Date();
      const todayMeetings = existingCache.data.filter((meeting) => {
        const meetingDate = new Date(
          meeting.date.split("/").reverse().join("-")
        );
        return meetingDate.toDateString() === today.toDateString();
      });
      updateRoomStatus(todayMeetings);
    }
  } catch (error) {
    if (error.name === "NotAllowedError") {
      clearInterval(window.fileCheckInterval);
      fileHandle = null;
    }
  }
}
