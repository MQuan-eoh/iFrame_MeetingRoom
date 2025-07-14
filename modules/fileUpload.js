// File upload and cache management logic for meeting room dashboard
import { processExcelFile, updateScheduleTable } from "../modules/schedule.js";
import {
  updateRoomStatus,
  isValidMeetingState,
} from "../modules/roomStatus.js";
import {
  showProgressBar,
  hideProgressBar,
  updateProgress,
} from "../utils/domUtils.js";
import { showErrorModal } from "../modules/modal.js";

let fileHandle = null;
let lastFileData = null;
let fileCache = {
  data: null,
  lastModified: null,
  reader: new FileReader(),
};

export async function handleFileUpload(file, XLSX) {
  const progressContainer = document.getElementById("progressContainer");
  const progressStatus = document.getElementById("progressStatus");
  try {
    updateProgress(10, "Đang khởi tạo...");
    updateProgress(40, "Đang xử lý dữ liệu...");
    const data = await processExcelFile(
      file,
      XLSX,
      showErrorModal,
      isValidMeetingState
    );
    const existingCache = JSON.parse(localStorage.getItem("fileCache")) || {
      data: [],
    };
    const endedMeetings = existingCache.data
      ? existingCache.data.filter(
          (meeting) => meeting.isEnded && meeting.forceEndedByUser
        )
      : [];
    const mergedData = data.map((meeting) => {
      const endedMeeting = endedMeetings.find(
        (ended) =>
          ended.id === meeting.id &&
          ended.room === meeting.room &&
          ended.date === meeting.date
      );
      if (endedMeeting) {
        return {
          ...meeting,
          isEnded: true,
          forceEndedByUser: true,
          endTime: endedMeeting.endTime,
          lastUpdated: endedMeeting.lastUpdated,
          originalEndTime: endedMeeting.originalEndTime,
        };
      }
      return meeting;
    });
    const today = new Date();
    const filteredData = mergedData.filter((meeting) => {
      const meetingDate = new Date(meeting.date.split("/").reverse().join("-"));
      return meetingDate.toDateString() === today.toDateString();
    });
    updateProgress(60, "Đang cập nhật bảng...");
    updateScheduleTable(filteredData.length > 0 ? filteredData : mergedData);
    updateRoomStatus(mergedData);
    // ...existing code for auto update, cache, etc...
    updateProgress(100, "Hoàn thành!");
    hideProgressBar();
    setTimeout(() => {
      progressContainer.style.display = "none";
      progressContainer.classList.remove("upload-complete");
    }, 2000);
  } catch (error) {
    progressStatus.textContent = "Tải lên thất bại!";
    progressStatus.style.color = "#f44336";
    setTimeout(() => {
      progressContainer.style.display = "none";
    }, 2000);
    alert("Lỗi khi xử lý file. Vui lòng thử lại.");
  }
}
