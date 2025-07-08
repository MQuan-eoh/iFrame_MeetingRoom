function getCurrentDate() {
  const now = new Date();
  now.setHours(now.getHours() + 7);

  const date = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${date}/${month}/${year}`;
}
function formatTime(timeStr) {
  if (!timeStr) return "";

  console.log("Formatting time value:", timeStr, "Type:", typeof timeStr);

  // Handle Date objects from Excel
  if (timeStr instanceof Date) {
    const hours = timeStr.getHours();
    const minutes = timeStr.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }

  // Handle Excel time values (numbers between 0 and 1)
  if (typeof timeStr === "number" || !isNaN(timeStr)) {
    const floatTime = parseFloat(timeStr);
    if (floatTime >= 0 && floatTime <= 1) {
      const totalMinutes = Math.round(floatTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }
  }

  // Handle string format
  if (typeof timeStr === "string") {
    const normalizedTime = timeStr
      .toLowerCase()
      .trim()
      .replace(/[^0-9h:\.]/g, "")
      .replace(/\s+/g, "");

    const timeFormats = {
      colon: /^(\d{1,2}):(\d{2})$/, // 13:30
      hourMinute: /^(\d{1,2})h(\d{2})$/, // 13h30
      decimal: /^(\d{1,2})\.(\d{2})$/, // 13.30
      simple: /^(\d{1,2})(\d{2})$/, // 1330
    };

    for (const [format, regex] of Object.entries(timeFormats)) {
      const match = normalizedTime.match(regex);
      if (match) {
        const [_, hours, minutes] = match;
        const hrs = parseInt(hours, 10);
        const mins = parseInt(minutes, 10);

        if (hrs >= 0 && hrs < 24 && mins >= 0 && mins < 60) {
          return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
          )}`;
        }
      }
    }
  }

  return "";
}

// Cập nhật hàm isTimeInRange để xử lý giây
function isTimeInRange(currentTime, startTime, endTime) {
  const current = timeToMinutes(currentTime);
  // Thêm :00 cho giây
  const start = timeToMinutes(`${startTime}:00`);
  const end = timeToMinutes(`${endTime}:00`);
  return current >= start && current <= end;
}

function formatDayOfWeek(day) {
  if (!day) return "";

  const dayMap = {
    2: "Thứ Hai",
    3: "Thứ Ba",
    4: "Thứ Tư",
    5: "Thứ Năm",
    6: "Thứ Sáu",
    7: "Thứ Bảy",
    CN: "Chủ Nhật",
    "THỨ 2": "Thứ Hai",
    "THỨ 3": "Thứ Ba",
    "THỨ 4": "Thứ Tư",
    "THỨ 5": "Thứ Năm",
    "THỨ 6": "Thứ Sáu",
    "THỨ 7": "Thứ Bảy",
    "CHỦ NHẬT": "Chủ Nhật",
  };

  const normalizedDay = String(day).trim().toUpperCase();
  return dayMap[normalizedDay] || day;
}

// Hàm format tên phòng
function formatRoomName(room) {
  if (!room) return "";

  // Chuẩn hóa tên phòng - xử lý cả viết tắt
  const normalized = String(room)
    .toLowerCase()
    .replace(
      /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/(p\.?|phòng)\s*/g, "phòng ") // Chuẩn hóa phần "P." hoặc "Phòng"
    .replace(/(lau|lầu)/g, "lầu")
    .trim();

  console.log(`Formatting room: ${room} -> ${normalized}`); // Log để debug

  // Ánh xạ tên chuẩn
  const mapping = {
    "phòng họp lầu 3": "Phòng họp lầu 3",
    "phòng họp lầu 4": "Phòng họp lầu 4",
    "phong hop lau 3": "Phòng họp lầu 3",
    "p hop lau 3": "Phòng họp lầu 3",
    "p.hop lau 3": "Phòng họp lầu 3",
  };

  return mapping[normalized] || room;
}

// Hàm format thời gian sử dụng
function formatDuration(duration) {
  if (!duration) return "";

  console.log("Formatting duration value:", duration, "Type:", typeof duration);

  // Handle Date objects from Excel
  if (duration instanceof Date) {
    const hours = duration.getHours();
    const minutes = duration.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }

  // Handle string format "HH:MM"
  if (typeof duration === "string") {
    const match = duration.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const [_, hours, minutes] = match;
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    }
  }

  // Handle numeric values (Excel time)
  if (typeof duration === "number" || !isNaN(duration)) {
    const floatDuration = parseFloat(duration);
    if (floatDuration > 0) {
      const totalMinutes = Math.round(floatDuration * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }
  }

  return "";
}

// Hàm xác định mục đích sử dụng
function determinePurpose(content) {
  if (!content) return "Khác";

  const contentLower = String(content).toLowerCase();

  if (contentLower.includes("họp")) return "Họp";
  if (contentLower.includes("đào tạo")) return "Đào tạo";
  if (contentLower.includes("phỏng vấn") || contentLower.includes("pv"))
    return "Phỏng vấn";

  return "Khác";
}

function processExcelFile(file) {
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

        // Tìm và xử lý header
        const headerRowIndex = rawData.findIndex((row) =>
          row.some((cell) =>
            String(cell)
              .toLowerCase()
              .match(/giờ|thời gian|start|end|duration/i)
          )
        );

        if (headerRowIndex === -1) {
          console.warn("Warning: Header row not found");
          return reject(new Error("Cannot find header row"));
        }

        // Get header row and find column indices
        const headers = rawData[headerRowIndex].map((h) =>
          String(h).toLowerCase().trim()
        );
        console.log("Headers found:", headers);

        // More flexible column matching
        const columnIndices = {
          startTime: headers.findIndex(
            (h) =>
              h.includes("GIỜ BẮT ĐẦU") ||
              h.includes("start") ||
              h.includes("bắt đầu") ||
              h === "start time"
          ),
          endTime: headers.findIndex(
            (h) =>
              h.includes("GIỜ KẾT THÚC") ||
              h.includes("end") ||
              h.includes("kết thúc") ||
              h === "end time"
          ),
          duration: headers.findIndex(
            (h) =>
              h.includes("THỜI GIAN SỬ DỤNG") ||
              h.includes("duration") ||
              h.includes("thời gian") ||
              h === "duration time"
          ),
        };

        console.log("Column indices found:", columnIndices);

        // Validate column indices
        if (
          columnIndices.startTime === -1 ||
          columnIndices.endTime === -1 ||
          columnIndices.duration === -1
        ) {
          console.warn("Warning: Some columns not found", columnIndices);
        }

        const meetings = [];
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row.some((cell) => cell)) continue; // Skip empty rows

          // Log raw values for debugging
          console.log(`Processing row ${i}:`, {
            rawStartTime: row[columnIndices.startTime],
            rawEndTime: row[columnIndices.endTime],
            rawDuration: row[columnIndices.duration],
          });

          // Extract time values with fallback to specific columns if needed
          const startTimeValue = row[columnIndices.startTime] || row[3]; // Fallback to column D
          const endTimeValue = row[columnIndices.endTime] || row[4]; // Fallback to column E
          const durationValue = row[columnIndices.duration] || row[5]; // Fallback to column F

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

          console.log(`Processed meeting data:`, meeting);
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
        console.error("Error processing file:", error);
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function formatDate(dateInput) {
  console.log("formatDate input:", dateInput, "type:", typeof dateInput);

  if (!dateInput) return "";

  try {
    // Xử lý Date object từ Excel (do cellDates: true)
    if (dateInput instanceof Date) {
      if (!isNaN(dateInput.getTime())) {
        const adjustedDate = new Date(dateInput);
        const day = adjustedDate.getDate();
        const month = adjustedDate.getMonth() + 1;
        const year = adjustedDate.getFullYear();

        return `${String(day).padStart(2, "0")}/${String(month).padStart(
          2,
          "0"
        )}/${year}`;
      }
    }
    // Xử lý chuỗi ngày đã được format sẵn dd/mm/yyyy
    if (typeof dateInput === "string") {
      const dateStr = dateInput.trim();
      const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const [_, day, month, year] = match;
        return `${String(day).padStart(2, "0")}/${String(month).padStart(
          2,
          "0"
        )}/${year}`;
      }
    }

    // Xử lý số serial từ Excel (nếu không dùng cellDates: true)
    if (typeof dateInput === "number" || !isNaN(Number(dateInput))) {
      const numDate = Number(dateInput);
      // Excel bắt đầu từ 1/1/1900, và trừ đi 2 để điều chỉnh lỗi năm nhuận
      const excelEpoch = new Date(1900, 0, -1);
      const offsetDays = numDate - 1;
      const resultDate = new Date(excelEpoch);
      resultDate.setDate(resultDate.getDate() + offsetDays);

      if (!isNaN(resultDate.getTime())) {
        const day = resultDate.getDate();
        const month = resultDate.getMonth() + 1;
        const year = resultDate.getFullYear();
        return `${String(day).padStart(2, "0")}/${String(month).padStart(
          2,
          "0"
        )}/${year}`;
      }
    }

    console.log("Could not parse date:", dateInput);
    return "";
  } catch (error) {
    console.error("Error in formatDate:", error);
    return "";
  }
}

function parseMeetingInfo(cellContent) {
  if (!cellContent) return { purpose: "", content: "" };

  const lines = cellContent.split("\r\n");
  const content = lines[0];
  let purpose = "";

  // Extract purpose from common patterns
  if (content.toLowerCase().includes("họp")) {
    purpose = "Họp";
  } else if (content.toLowerCase().includes("đào tạo")) {
    purpose = "Đào tạo";
  } else if (content.toLowerCase().includes("pv")) {
    purpose = "Phỏng vấn";
  } else {
    purpose = "Khác";
  }

  return {
    purpose,
    content,
  };
}

function calculateEndTime(startTime) {
  if (!startTime) return "";

  // Convert time format (e.g., "7H30" to "8:00")
  const time = startTime.replace("H", ":").replace("h", ":");
  const [hours, minutes] = time.split(":").map(Number);

  // Add 30 minutes for default meeting duration
  let endHours = hours;
  let endMinutes = minutes + 30;

  if (endMinutes >= 60) {
    endHours += 1;
    endMinutes -= 60;
  }

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
    2,
    "0"
  )}`;
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "";

  const start = startTime.replace("H", ":").replace("h", ":");
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const durationMinutes =
    endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}`;
}
// Cập nhật bảng lịch
function updateScheduleTable(data) {
  const tableBody = document.querySelector(".schedule-table");
  const headerRow = tableBody.querySelector(".table-header");
  updateProgress(40, "Đang đồng bộ hóa dữ liệu...");
  // Xóa các hàng cũ
  Array.from(tableBody.children)
    .filter((child) => child !== headerRow)
    .forEach((child) => child.remove());

  // Thêm dữ liệu mới
  data.forEach((meeting) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.setAttribute("role", "row");
    updateProgress(70, "Đang cập nhật dữ liệu...");
    console.log("Đang cập nhật dữ liệu với processing bar");
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
    console.log("Đồng bộ hóa dữ liệu thành công ! ");
    hideProgressBar();
  });
}
// Sửa hàm timeToMinutes để xử lý giây
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parts.length > 2 ? parseInt(parts[2]) : 0;
  return hours * 3600 + minutes * 60 + seconds;
}

// Function to show the progress bar
function showProgressBar() {
  const progressContainer = document.querySelector(".window");
  if (progressContainer) {
    //hiệu ứng cho processing bar
    progressContainer.classList.add("show");
    progressContainer.style.display = "block"; // Show the progress bar
    overlay.style.display = "block";
  }
}

// Function to hide the progress bar
function hideProgressBar() {
  const progressContainer = document.querySelector(".window");
  if (progressContainer) {
    progressContainer.classList.remove("show");
    progressContainer.style.display = "none"; // Hide the progress bar
    overlay.style.display = "none";
  }
}

// Event listener for the upload button
document.addEventListener("DOMContentLoaded", function () {
  const uploadButton = document.querySelector(".upload-button");
  showProgressBar();
  uploadButton.addEventListener("click", async function (event) {
    event.preventDefault();
    try {
      // Thử dùng file handle đã có
      if (fileHandle) {
        const file = await fileHandle.getFile();
        await handleFileUpload(file);
        return;
      }
    } catch (error) {
      console.error("Không thể sử dụng file handle cũ:", error);
      fileHandle = null;
    }

    // Nếu không có file handle hoặc có lỗi, tạo input mới
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", function (e) {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        handleFileUpload(file);
        showProgressBar();
      }
    });

    fileInput.click();
  });

  // Event listener for clicks outside the upload button
  document.addEventListener("click", function (event) {
    if (!uploadButton.contains(event.target)) {
    }
  });
});

document
  .getElementById("stopUploadBtn")
  .addEventListener("click", hideProgressBar);

/*=================Hàm xử lý file Upload==============*/
async function handleFileUpload(file) {
  const progressContainer = document.getElementById("progressContainer");
  const progressStatus = document.getElementById("progressStatus");

  try {
    updateProgress(10, "Đang khởi tạo...");

    // try {
    //   updateProgress(20, "Đang đọc file...");
    //   const handles = await window.showOpenFilePicker({
    //     multiple: false,
    //     types: [
    //       {
    //         description: "Excel Files",
    //         accept: {
    //           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    //             [".xlsx"],
    //           "application/vnd.ms-excel": [".xls"],
    //         },
    //       },
    //     ],
    //   });
    //   fileHandle = handles[0];
    //   const initialFile = await fileHandle.getFile();
    //   lastFileData = await initialFile.text();
    // } catch (error) {
    //   console.error("Không thể lấy file handle:", error);
    // }

    updateProgress(40, "Đang xử lý dữ liệu...");
    const data = await processExcelFile(file);

    // Lấy dữ liệu từ cache để merge
    const existingCache = JSON.parse(localStorage.getItem("fileCache")) || {
      data: [],
    };
    const endedMeetings = existingCache.data
      ? existingCache.data.filter(
          (meeting) => meeting.isEnded && meeting.forceEndedByUser
        )
      : [];

    // // Merge dữ liệu mới với trạng thái các cuộc họp đã kết thúc
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
    startAutoUpdate(mergedData);

    updateProgress(80, "Đang lưu cache...");
    // fileCache.data = mergedData;
    // fileCache.lastModified = new Date().getTime();

    localStorage.setItem(
      "fileCache",
      JSON.stringify({
        data: fileCache.data,
        lastModified: fileCache.lastModified,
      })
    );

    updateProgress(90, "Đang thiết lập giám sát...");
    if (fileHandle) {
      if (window.fileCheckInterval) {
        clearInterval(window.fileCheckInterval);
      }
      window.fileCheckInterval = setInterval(checkFileChanges, 5000);
    }

    updateProgress(100, "Hoàn thành!");
    hideProgressBar();

    setTimeout(() => {
      progressContainer.style.display = "none";
      progressContainer.classList.remove("upload-complete");
    }, 2000);
  } catch (error) {
    console.error("Lỗi xử lý file:", error);
    progressStatus.textContent = "Tải lên thất bại!";
    progressStatus.style.color = "#f44336";

    setTimeout(() => {
      progressContainer.style.display = "none";
    }, 2000);

    alert("Lỗi khi xử lý file. Vui lòng thử lại.");
  }
}

// Tải file lên server
async function uploadToServer(file, processedData) {
  const formData = new FormData();
  formData.append("meetingFile", file);
  formData.append("processedData", JSON.stringify(processedData));

  try {
    const response = await fetch("/api/upload-meeting", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Upload thành công:", result);
    return result;
  } catch (error) {
    console.error("Lỗi khi upload:", error);
    throw error;
  }
}

//========================Update Time ====================

function updateClock() {
  const now = new Date();
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());
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
    logoElement.innerHTML = `
    <div class="clock-container">
      ${time}
    </div>
  `;
  }

  const currentDateElement = document.querySelector(".current-date");
  if (currentDateElement) {
    /*currentDateElement.textContent = "Thứ 2, \n10/12/2024";*/
    currentDateElement.style.fontSize = "15px"; // Thay đổi kích thước font
    currentDateElement.style.color = "#ffffff"; // Thay đổi màu chữ
    currentDateElement.style.fontWeight = "bold"; // Đậm chữ
    currentDateElement.style.paddingRight = "25px";
  }
}
function getFormattedDate() {
  const days = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const now = new Date();

  const dayOfWeek = days[now.getDay()];
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${dayOfWeek},\n${day}/${month}/${year}`;
}

function updateDate() {
  const currentDateElement = document.querySelector(".current-date");
  if (currentDateElement) {
    currentDateElement.textContent = getFormattedDate();
  }
}

// Cập nhật thời gian thực mỗi giây
setInterval(updateDate, 1000);

// Hiển thị ngày ngay khi tải trang
updateDate();

// Khởi tạo đồng hồ và cập nhật mỗi giây
function initClock() {
  updateClock(); // Cập nhật ngay lập tức
  setInterval(updateClock, 1000); // Cập nhật mỗi giây
}
// Hàm kiểm tra xung đột thời gian giữa các cuộc họp
function checkTimeConflict(meeting1, meeting2) {
  const start1 = timeToMinutes(meeting1.startTime);
  const end1 = timeToMinutes(meeting1.endTime);
  const start2 = timeToMinutes(meeting2.startTime);
  const end2 = timeToMinutes(meeting2.endTime);
  return start1 < end2 && start2 < end1;
}

// Hàm kiểm tra xung đột lịch họp
async function validateMeetings(meetings) {
  const conflicts = [];
  const processedMeetings = new Set();

  for (let i = 0; i < meetings.length; i++) {
    const currentMeeting = meetings[i];
    const key = `${currentMeeting.date}_${currentMeeting.room}`;

    // Kiểm tra với các cuộc họp khác cùng ngày và cùng phòng
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

function checkTimeConflict(meeting1, meeting2) {
  const start1 = timeToMinutes(meeting1.startTime);
  const end1 = timeToMinutes(meeting1.endTime);
  const start2 = timeToMinutes(meeting2.startTime);
  const end2 = timeToMinutes(meeting2.endTime);

  // Kiểm tra xem hai khoảng thời gian có giao nhau không
  return start1 < end2 && start2 < end1;
}

// Hàm kiểm tra xung đột cho một cuộc họp mới
function validateNewMeeting(newMeeting, existingMeetings) {
  const conflicts = [];

  // Chỉ kiểm tra các cuộc họp cùng ngày và cùng phòng
  const relevantMeetings = existingMeetings.filter(
    (meeting) =>
      meeting.date === newMeeting.date &&
      normalizeRoomName(meeting.room) === normalizeRoomName(newMeeting.room)
  );

  for (const existingMeeting of relevantMeetings) {
    if (checkTimeConflict(newMeeting, existingMeeting)) {
      conflicts.push({
        conflictWith: existingMeeting,
        type: "TIME_OVERLAP",
        message: `Xung đột với cuộc họp "${
          existingMeeting.content || existingMeeting.purpose
        }" 
                 từ ${existingMeeting.startTime} đến ${
          existingMeeting.endTime
        }`,
      });
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
}

// Hàm hiển thị modal thông báo lỗi
function showErrorModal(message) {
  // Tạo modal container
  const modalContainer = document.createElement("div");
  modalContainer.className = "error-modal-container";
  modalContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  // Tạo modal content
  const modalContent = document.createElement("div");
  modalContent.className = "error-modal-content";
  modalContent.style.cssText = `
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    position: relative;
  `;

  // Tạo tiêu đề
  const title = document.createElement("h3");
  title.textContent = "Lỗi Xung Đột Lịch Họp";
  title.style.color = "#dc3545";

  // Tạo nội dung
  const content = document.createElement("pre");
  content.textContent = message;
  content.style.whiteSpace = "pre-wrap";
  content.style.marginTop = "10px";

  // Tạo nút đóng
  const closeButton = document.createElement("button");
  closeButton.textContent = "Đóng";
  closeButton.style.cssText = `
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  closeButton.onclick = () => modalContainer.remove();

  // Ghép các phần tử
  modalContent.appendChild(title);
  modalContent.appendChild(content);
  modalContent.appendChild(closeButton);
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);
}

/*======Change Background Feature========= */
document.addEventListener("DOMContentLoaded", function () {
  // Khai báo các elements
  const elements = {
    settingsIcon: document.querySelector(".settings-icon"),
    settingsContent: document.querySelector(".settings-content"),
    mainBgContainer: document.querySelector(".main-bg-container"),
    scheduleBgContainer: document.querySelector(".schedule-bg-container"),
    resetBackgroundButton: document.querySelector(".reset-background-button"),
    changeNameContainer: document.querySelector(".change-name-container"),
    welcomeMessage: document.querySelector(".welcome-message"),
  };

  // Template cho modal
  const modalTemplate = `
    <div class="modal-overlay"></div>
    <div class="name-change-modal">
      <input type="text" id="newNameInput" placeholder="Nhập tên mới">
      <div class="modal-buttons">
        <button class="modal-button cancel-button">Hủy</button>
        <button class="modal-button save-button">Lưu</button>
      </div>
    </div>
  `;

  // Khởi tạo modal
  function initializeModal() {
    document.body.insertAdjacentHTML("beforeend", modalTemplate);
    return {
      modal: document.querySelector(".name-change-modal"),
      overlay: document.querySelector(".modal-overlay"),
      input: document.getElementById("newNameInput"),
      saveBtn: document.querySelector(".save-button"),
      cancelBtn: document.querySelector(".cancel-button"),
    };
  }

  const modalElements = initializeModal();

  // Các functions xử lý modal
  const modalHandlers = {
    open() {
      modalElements.modal.classList.add("active");
      modalElements.overlay.classList.add("active");
      modalElements.input.value = elements.welcomeMessage.textContent;
      modalElements.input.focus();
    },

    close() {
      modalElements.modal.classList.remove("active", "keyboard-active");
      modalElements.overlay.classList.remove("active");
      elements.changeNameContainer.classList.remove("keyboard-visible");
      modalElements.input.blur();
    },

    save() {
      const newName = modalElements.input.value.trim();
      if (newName) {
        elements.welcomeMessage.textContent = newName;
        localStorage.setItem("welcomeMessage", newName);
      }
      this.close();
    },
  };

  // Functions xử lý settings menu
  const settingsHandlers = {
    toggleMenu(event) {
      event.stopPropagation();
      const classes = [
        elements.settingsContent,
        elements.mainBgContainer,
        elements.scheduleBgContainer,
        elements.resetBackgroundButton,
        elements.changeNameContainer,
      ];

      classes.forEach((element) => element.classList.toggle("active"));

      elements.settingsIcon.style.transform =
        elements.settingsContent.classList.contains("active")
          ? "rotate(90deg)"
          : "rotate(0deg)";
    },

    closeMenu() {
      const classes = [
        elements.settingsContent,
        elements.mainBgContainer,
        elements.scheduleBgContainer,
        elements.resetBackgroundButton,
        elements.changeNameContainer,
      ];

      classes.forEach((element) => element.classList.remove("active"));
      elements.settingsIcon.style.transform = "rotate(0deg)";
    },
  };

  // Event Listeners cho keyboard
  modalElements.input.addEventListener("focus", () => {
    modalElements.modal.classList.add("keyboard-active");
    elements.changeNameContainer.classList.add("keyboard-visible");
  });

  modalElements.input.addEventListener("blur", () => {
    modalElements.modal.classList.remove("keyboard-active");
    elements.changeNameContainer.classList.remove("keyboard-visible");
  });

  // Event Listeners cho các buttons
  elements.settingsIcon.addEventListener("click", settingsHandlers.toggleMenu);

  document
    .querySelector(".change-name-button")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      modalHandlers.open();
    });

  modalElements.saveBtn.addEventListener("click", () => modalHandlers.save());
  modalElements.cancelBtn.addEventListener("click", () =>
    modalHandlers.close()
  );

  // Event Listener cho phím Enter
  modalElements.input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      modalHandlers.save();
    }
  });

  // Event Listener cho click outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".background-management")) {
      settingsHandlers.closeMenu();
    }
  });

  // Load saved welcome message
  const savedMessage = localStorage.getItem("welcomeMessage");
  if (savedMessage) {
    elements.welcomeMessage.textContent = savedMessage;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Lấy các phần tử cần thiết
  const mainBackgroundUploadBtn = document.querySelector(
    ".main-background-btn"
  );
  const scheduleBackgroundUploadBtn = document.querySelector(
    ".schedule-background-btn"
  );
  const mainBackgroundUploadInput = document.getElementById(
    "mainBackgroundUpload"
  );
  const scheduleBackgroundUploadInput = document.getElementById(
    "scheduleBackgroundUpload"
  );
  const resetBackgroundButton = document.querySelector(
    ".reset-background-button"
  );

  const meetingScreen = document.querySelector(".meeting-screen");
  const scheduleContent = document.querySelector(".schedule-content");

  // Thêm Font Awesome nếu chưa có
  function addFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesomeLink = document.createElement("link");
      fontAwesomeLink.rel = "stylesheet";
      fontAwesomeLink.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
      document.head.appendChild(fontAwesomeLink);
    }
  }
  addFontAwesome();

  // Tạo modal preview
  function createPreviewModal(imageDataUrl, type) {
    const modal = document.createElement("div");
    modal.className = "background-preview-modal";

    modal.innerHTML = `
      <div class="background-preview-content">
        <img src="${imageDataUrl}" alt="Background Preview">
        <div class="background-preview-actions">
          <button class="background-confirm-btn">Xác Nhận</button>
          <button class="background-cancel-btn">Hủy</button>
        </div>
      </div> 
    `;

    const modalContainer = document.querySelector(".modal-container");
    modalContainer.appendChild(modal);

    // Trigger show effect
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);

    const confirmBtn = modal.querySelector(".background-confirm-btn");
    const cancelBtn = modal.querySelector(".background-cancel-btn");

    confirmBtn.addEventListener("click", () => {
      if (type === "main") {
        localStorage.setItem("customMainBackground", imageDataUrl);
        meetingScreen.style.backgroundImage = `url(${imageDataUrl})`;
        meetingScreen.style.backgroundSize = "cover";
        meetingScreen.style.backgroundPosition = "center";
      } else if (type === "schedule") {
        localStorage.setItem("customScheduleBackground", imageDataUrl);
        scheduleContent.style.backgroundImage = `url(${imageDataUrl})`;
        scheduleContent.style.backgroundSize = "cover";
        scheduleContent.style.backgroundPosition = "center";
      }

      modal.classList.remove("show");
      setTimeout(() => {
        modalContainer.removeChild(modal);
      }, 300);
    });

    cancelBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      setTimeout(() => {
        modalContainer.removeChild(modal);
      }, 300);
    });
  }

  // Xử lý upload background chính
  mainBackgroundUploadBtn.addEventListener("click", function () {
    mainBackgroundUploadInput.click();
  });

  mainBackgroundUploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        createPreviewModal(e.target.result, "main");
      };
      reader.readAsDataURL(file);
    }
  });

  // Xử lý upload background lịch
  scheduleBackgroundUploadBtn.addEventListener("click", function () {
    scheduleBackgroundUploadInput.click();
  });

  scheduleBackgroundUploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        createPreviewModal(e.target.result, "schedule");
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset background
  resetBackgroundButton.addEventListener("click", function () {
    // Tạo modal xác nhận
    const modalContainer = document.querySelector(".modal-container");
    const confirmModal = document.createElement("div");
    confirmModal.className = "background-preview-modal";
    confirmModal.innerHTML = `
      <div class="background-preview-content">
           <h3 style="color: rgba(255, 255, 255, 0.9);margin-bottom: 25px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Bạn muốn Reset Background nào?</h3>
        <div class="background-preview-actions">
          <button class="reset-main-btn">Background Chính</button>
          <button class="reset-schedule-btn">Background Lịch</button>
          <button class="background-cancel-btn">Hủy</button>
        </div>
      </div>
    `;
    modalContainer.appendChild(confirmModal);

    // Trigger show effect
    setTimeout(() => {
      confirmModal.classList.add("show");
    }, 10);

    const resetMainBtn = confirmModal.querySelector(".reset-main-btn");
    const resetScheduleBtn = confirmModal.querySelector(".reset-schedule-btn");
    const cancelBtn = confirmModal.querySelector(".background-cancel-btn");

    resetMainBtn.addEventListener("click", () => {
      localStorage.removeItem("customMainBackground");
      meetingScreen.style.backgroundImage = "url(assests/imgs/background.jpg)";
      confirmModal.classList.remove("show");
      setTimeout(() => {
        modalContainer.removeChild(confirmModal);
      }, 300);
    });

    resetScheduleBtn.addEventListener("click", () => {
      localStorage.removeItem("customScheduleBackground");
      scheduleContent.style.backgroundImage =
        "url(assests/imgs/default-schedule-background.jpg)";
      confirmModal.classList.remove("show");
      setTimeout(() => {
        modalContainer.removeChild(confirmModal);
      }, 300);
    });

    cancelBtn.addEventListener("click", () => {
      confirmModal.classList.remove("show");
      setTimeout(() => {
        modalContainer.removeChild(confirmModal);
      }, 300);
    });
  });

  // Kiểm tra và áp dụng background từ localStorage khi tải trang
  function applyStoredBackgrounds() {
    const savedMainBackground = localStorage.getItem("customMainBackground");
    const savedScheduleBackground = localStorage.getItem(
      "customScheduleBackground"
    );

    if (savedMainBackground) {
      meetingScreen.style.backgroundImage = `url(${savedMainBackground})`;
      meetingScreen.style.backgroundSize = "cover";
      meetingScreen.style.backgroundPosition = "center";
    }

    if (savedScheduleBackground) {
      scheduleContent.style.backgroundImage = `url(${savedScheduleBackground})`;
      scheduleContent.style.backgroundSize = "cover";
      scheduleContent.style.backgroundPosition = "center";
    }
  }

  // Gọi hàm áp dụng background
  applyStoredBackgrounds();
});

//==========Function Update info from Excel file to MeetingInfo Section========
function updateRoomStatus(data) {
  console.log("Updating room status with data at:", getCurrentTime());

  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  console.log("Current date:", currentDate);
  console.log("Current time:", currentTime);

  const todayMeetings = data.filter((meeting) => {
    const isToday = meeting.date === currentDate;
    console.log(`Meeting date: ${meeting.date}, Is today: ${isToday}`);
    return isToday;
  });

  console.log("Today's meetings:", todayMeetings);

  const roomsToUpdate = ["Phòng họp lầu 4", "Phòng họp lầu 3"];
  roomsToUpdate.forEach((roomName) => {
    updateSingleRoomStatus(roomName, todayMeetings, currentTime);
  });
}

function normalizeRoomName(roomname) {
  if (!roomname) return "";
  return String(roomname)
    .toLowerCase()
    .replace(
      /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/(p\.?|phòng)\s*/g, "phòng ")
    .replace(/(lau|lầu)/g, "lầu")
    .trim();
}

//===New version : Update thểm cả giây vì nếu so sánh mỗi phút thì sẽ sau 1 phút thì mới nhảy kết quả
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

// Sửa hàm isTimeOverdue để có độ chính xác cao hơn
function isTimeOverdue(endTime, currentTime) {
  const endTimeParts = endTime.split(":");
  const endTimeWithSeconds = `${endTimeParts[0]}:${endTimeParts[1]}:00`;
  const isOverdue =
    timeToMinutes(currentTime) > timeToMinutes(endTimeWithSeconds);

  if (isOverdue) {
    console.log(
      `Meeting overdue check at ${currentTime} for end time ${endTime}`
    );
  }

  return isOverdue;
}

//=====Hàm để tự động cập nhật thời gian và trạng thái - Function related times, overdueTime=======
function startAutoUpdate(data) {
  updateRoomStatus(data);
  const intervalId = setInterval(() => {
    const currentTime = getCurrentTime();
    // Chỉ cập nhật khi thay đổi phút
    if (currentTime.endsWith(":00")) {
      console.log("Auto updating at:", currentTime);
      updateRoomStatus(data);
    }
  }, 1000); // Vẫn kiểm tra mỗi giây nhưng chỉ cập nhật khi đổi phút

  window.autoUpdateInterval = intervalId;
  return () => clearInterval(intervalId);
}

let previousStates = {};
function updateSingleRoomStatus(roomCode, meetings, currentTime) {
  console.log("Updating room status for:", roomCode);

  const normalizeRoomName = (name) =>
    name.toLowerCase().replace(/\s+/g, " ").trim();

  const roomSections = document.querySelectorAll(".room-section");
  const roomSection = Array.from(roomSections).find((section) => {
    const roomElement = section.querySelector(".room-number");
    return (
      roomElement &&
      normalizeRoomName(roomElement.textContent) === normalizeRoomName(roomCode)
    );
  });

  if (!roomSection) {
    console.warn(`No room section found for room code: ${roomCode}`);
    return;
  }

  const titleElement = roomSection.querySelector(".meeting-title");
  const startTimeElement = roomSection.querySelector(".start-time");
  const endTimeElement = roomSection.querySelector(".end-time");
  const statusIndicator = roomSection.querySelector(
    ".status-indicator .status-text"
  );
  const indicatorDot = roomSection.querySelector(
    ".status-indicator .indicator-dot"
  );

  // Lọc các cuộc họp cho phòng hiện tại, bao gồm cả những cuộc họp đã kết thúc
  const roomMeetings = meetings.filter(
    (meeting) =>
      normalizeRoomName(meeting.room) === normalizeRoomName(roomCode) &&
      !isTimeOverdue(meeting.endTime, currentTime)
  );

  // Tìm cuộc họp đang diễn ra và chưa bị kết thúc sớm
  const activeMeeting = roomMeetings.find(
    (meeting) =>
      isValidMeetingState(meeting, currentTime) &&
      !meeting.isEnded &&
      !meeting.forceEndedByUser
  );

  // Cập nhật giao diện
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
    // Kiểm tra xem có cuộc họp sắp diễn ra không
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
if (!Element.prototype.contains) {
  Element.prototype.contains = function (text) {
    return this.textContent.trim().includes(text);
  };
}

let fileHandle = null;
let lastFileData = null;
let fileCache = {
  data: null,
  lastModified: null,
  reader: new FileReader(),
};
// Hàm kiểm tra thay đổi từ input element
async function checkFileChanges() {
  if (!fileHandle) return;

  try {
    const file = await fileHandle.getFile();
    const fileData = await file.text();

    if (lastFileData === null) {
      lastFileData = fileData;
      return;
    }

    // Lấy dữ liệu từ cache
    const existingCache = JSON.parse(localStorage.getItem("fileCache")) || {
      data: [],
    };

    // Lọc ra các cuộc họp đã kết thúc sớm
    const endedMeetings = existingCache.data.filter(
      (meeting) => meeting.isEnded && meeting.forceEndedByUser
    );

    if (fileData !== lastFileData) {
      console.log("File đã thay đổi, đang cập nhật...");
      const newData = await processExcelFile(file);
      showProgressBar();
      updateProgress(0, "Đang đọc dữ liệu từ file...");
      // Merge dữ liệu mới với trạng thái các cuộc họp đã kết thúc
      const mergedData = newData.map((meeting) => {
        updateProgress(30, "Đang phân tích dữ liệu...");
        const endedMeeting = endedMeetings.find(
          (ended) =>
            ended.id === meeting.id &&
            ended.room === meeting.room &&
            ended.date === meeting.date
        );

        if (endedMeeting) {
          // Giữ nguyên thông tin của cuộc họp đã kết thúc
          return endedMeeting;
        }
        return meeting;
      });
      updateProgress(60, "Đang hợp nhất với dữ liệu hiện tại...");
      // Lọc các cuộc họp trong ngày
      const today = new Date();
      const todayMeetings = mergedData.filter((meeting) => {
        const meetingDate = new Date(
          meeting.date.split("/").reverse().join("-")
        );
        return meetingDate.toDateString() === today.toDateString();
      });
      updateProgress(75, "Đang cập nhật lịch trình...");
      // Cập nhật UI và cache
      updateScheduleTable(todayMeetings);
      updateRoomStatus(todayMeetings);

      fileCache.data = mergedData;
      fileCache.lastModified = new Date().getTime();

      localStorage.setItem(
        "fileCache",
        JSON.stringify({
          data: mergedData,
          lastModified: fileCache.lastModified,
        })
      );
      updateProgress(95, "Đang lưu bộ nhớ đệm...");
      lastFileData = fileData;
      updateProgress(100, "Cập nhật thành công!");
      setTimeout(hideProgressBar, 1000);
    } else {
      // Khi file không thay đổi, sử dụng dữ liệu từ cache
      const today = new Date();
      const todayMeetings = existingCache.data.filter((meeting) => {
        const meetingDate = new Date(
          meeting.date.split("/").reverse().join("-")
        );
        return meetingDate.toDateString() === today.toDateString();
      });

      console.log("Sử dụng dữ liệu từ cache:", todayMeetings);
      // updateScheduleTable(todayMeetings);
      updateRoomStatus(todayMeetings);
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra file:", error);
    if (error.name === "NotAllowedError") {
      clearInterval(window.fileCheckInterval);
      fileHandle = null;
    }
  }
}
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.background = "rgba(0, 0, 0, 0.8)";
overlay.style.filter = "blur(15px)";
overlay.style.zIndex = "999";
overlay.style.display = "none";
document.body.appendChild(overlay);

function updateProgress(percent, statusText) {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const progressStatus = document.getElementById("progressStatus");
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;
  progressStatus.textContent = statusText;
}
//========================Update Time ====================
function padZero(num) {
  return num < 10 ? `0${num}` : num;
}
// Gọi hàm khởi tạo khi trang đã load
document.addEventListener("DOMContentLoaded", initClock);
document.addEventListener("DOMContentLoaded", function () {
  const datePicker = document.getElementById("meetingDate");
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  datePicker.value = formattedDate;
  hideProgressBar();

  datePicker.addEventListener("change", function () {
    // Lấy dữ liệu từ localStorage
    const cachedData = JSON.parse(localStorage.getItem("fileCache"));

    if (cachedData && cachedData.data) {
      const selectedDate = new Date(this.value);
      const filteredData = cachedData.data.filter((meeting) => {
        const meetingDate = new Date(
          meeting.date.split("/").reverse().join("-")
        );
        return meetingDate.toDateString() === selectedDate.toDateString();
      });
      updateScheduleTable(filteredData);
    }
  });
});

/*================Full Screen Feature===============*/
document.addEventListener("DOMContentLoaded", function () {
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const meetingContainer = document.querySelector(".meeting-container");
  const meetingPage = document.querySelector(".meeting-page");
  const previewModal = document.querySelector(".modal-container");
  const changeNameContainer = document.querySelector(".change-name-container");
  const nameChangeModal = document.querySelector(".name-change-modal");
  const modalOverlay = document.querySelector(".modal-overlay");

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (meetingPage.requestFullscreen) {
        meetingPage.requestFullscreen();
      } else if (meetingPage.mozRequestFullScreen) {
        meetingPage.mozRequestFullScreen();
      } else if (meetingPage.webkitRequestFullscreen) {
        meetingPage.webkitRequestFullscreen();
      } else if (meetingPage.msRequestFullscreen) {
        meetingPage.msRequestFullscreen();
      }

      meetingContainer.classList.add("fullscreen-mode");
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';

      // Đảm bảo modal và overlay được append vào element đang fullscreen
      meetingPage.appendChild(nameChangeModal);
      meetingPage.appendChild(modalOverlay);
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      meetingContainer.classList.remove("fullscreen-mode");
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';

      // Đưa modal và overlay trở lại body
      document.body.appendChild(nameChangeModal);
      document.body.appendChild(modalOverlay);
    }
  }

  // Xử lý hiển thị modal
  const changeNameButton = document.querySelector(".change-name-button");
  const welcomeMessage = document.querySelector(".welcome-message");
  const newNameInput = document.getElementById("newNameInput");

  changeNameButton.addEventListener("click", function (event) {
    event.stopPropagation();
    changeNameContainer.classList.add("move-to-top");
    // Đảm bảo modal được append vào element đúng
    if (document.fullscreenElement) {
      document.fullscreenElement.appendChild(nameChangeModal);
      document.fullscreenElement.appendChild(modalOverlay);
    }

    modal.classList.add("active");
    modalOverlay.classList.add("active");
    newNameInput.value = welcomeMessage.textContent;
    newNameInput.focus();
  });

  // Xử lý fullscreen change
  function handleFullscreenChange() {
    if (!document.fullscreenElement) {
      meetingContainer.classList.remove("fullscreen-mode");
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';

      // Đưa modal và overlay về body khi thoát fullscreen
      document.body.appendChild(nameChangeModal);
      document.body.appendChild(modalOverlay);
    }
  }

  // Fullscreen change event listeners
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);

  // Add click event to fullscreen button
  fullscreenBtn.addEventListener("click", toggleFullScreen);
  document
    .querySelector(".cancel-button")
    .addEventListener("click", function () {
      nameChangeModal.classList.remove("active");
      modalOverlay.classList.remove("active");
      changeNameContainer.classList.remove("move-to-top"); // Chỉ remove class move-to-top khi click nút Hủy
    });

  document.querySelector(".save-button").addEventListener("click", function () {
    const newName = newNameInput.value.trim();
    if (newName) {
      welcomeMessage.textContent = newName;
      localStorage.setItem("welcomeMessage", newName);
      changeNameContainer.classList.remove("move-to-top");
    }
    nameChangeModal.classList.remove("active");
    modalOverlay.classList.remove("active");
  });

  modalOverlay.addEventListener("click", function () {
    nameChangeModal.classList.remove("active");
    modalOverlay.classList.remove("active");
  });

  // Optional: Escape key to exit fullscreen
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.fullscreenElement) {
      toggleFullScreen();
    }
  });

  // Load saved welcome message if exists
  const savedMessage = localStorage.getItem("welcomeMessage");
  if (savedMessage) {
    welcomeMessage.textContent = savedMessage;
  }
});

//====================Feature Go to Page 2=======================
document.addEventListener("DOMContentLoaded", function () {
  const roomButtons = document.querySelectorAll(".room-button");
  roomButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const roomText = this.querySelector(".button-text").textContent;
      if (roomText === "P.HỌP LẦU 3") {
        loadDynamicPage("room1");
      }
      if (roomText === "P.HỌP LẦU 4") {
        loadDynamicPage("room2");
      }
    });
  });
});
let statusAirConditioner = null;

let action = {
  "Phòng họp lầu 3": {
    actionOn: false,
    actionOff: false,
  },
  "Phòng họp lầu 4": {
    actionOn2: false,
    actionOff2: false,
  },
};

let acStates = {
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
const roomSuffixMap = {
  "Phòng họp lầu 3": "eRa",
  "Phòng họp lầu 4": "eRa2",
};
const roomEraMap = {
  "Phòng họp lầu 3": "eRa",
  "Phòng họp lầu 4": "eRa2",
};

function normalizeRoomKey(roomName) {
  return roomName.toLowerCase().replace(/\s+/g, " ").trim();
}
function getRoomPowerStats(roomKey) {
  const roomStats = {
    "phòng họp lầu 3": {
      temp: latestValues[configTemp?.id]?.value || 0,
      humi: latestValues[configHumi?.id]?.value || 0,
    },
    "phòng họp lầu 4": {
      temp: latestValues[configTemp2?.id]?.value || 0,
      humi: latestValues[configHumi2?.id]?.value || 0,
    },
  };

  return roomStats[roomKey.toLowerCase()] || { temp: 0, humi: 0 };
}

let acActions = {
  "Phòng họp lầu 3": { on: null, off: null },
  "Phòng họp lầu 4": { on: null, off: null },
};
let roomUpdateIntervals = {};
// Hàm render trang động riêng biệt
function renderRoomPage(data, roomKeyword, roomName) {
  console.log("Rendering room page for:", roomName);
  console.log("Data received:", data);
  console.log("=== INITIAL ROOM RENDER ===", {
    roomKeyword,
    roomName,
  });
  // Lọc các cuộc họp cho phòng
  const roomMeetings = data.filter((meeting) =>
    // meeting.room.toLowerCase().includes(roomKeyword.toLowerCase())
    meeting.room.toLowerCase().replace(/\s+/g, "-")
  );
  console.log("Filtered room meetings:", roomMeetings);

  // Lọc các cuộc họp diễn ra trong ngày
  const today = new Date();
  const filteredData = roomMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date.split("/").reverse().join("-"));
    return meetingDate.toDateString() === today.toDateString();
  });
  console.log("Today's meetings:", filteredData);
  const safeData = Array.isArray(data) ? data : [];
  const roomKey = normalizeRoomKey(roomKeyword);
  const eraSuffix = roomEraMap[roomKey];
  const normalizedRoomKey = roomKey.toLowerCase();
  const powerStats = getRoomPowerStats(normalizedRoomKey);

  console.log("Normalized room key:", roomKey);
  console.log("ERA suffix:", eraSuffix);
  console.log("Initial power stats:", powerStats);

  // Initialize room state if it doesn't exist
  if (!acStates[roomKey]) {
    console.log(`Initializing new state for room ${roomKey}`);
    acStates[roomKey] = {
      isOn: false,
      roomTemperatures: 20,
      minTemp: 16,
      maxTemp: 30,
      temproom: powerStats.tempValue,
      humidity: powerStats.humiValue,
    };
  } else {
    console.log(`Updating existing state for room ${roomKey}`);
    console.log("Previous state:", acStates[roomKey]);
    acStates[roomKey].temproom = powerStats.tempValue;
    acStates[roomKey].power = powerStats.humiValue;
    console.log("Updated state:", acStates[roomKey]);
  }
  // Cleanup existing interval nếu có
  // if (roomUpdateIntervals[roomKey]) {
  //   console.log(`Cleaning up existing interval for ${roomKey}`);
  //   clearInterval(roomUpdateIntervals[roomKey]);
  // }

  updateACStatus = function (container, room) {
    console.log("=== AC Status Update Debug ===");
    console.log(`Updating AC status for room: ${room}`);
    console.log("TempRoom AC state:", acStates[room]);

    const roomKey = normalizeRoomKey(room);
    const eraSuffix = roomEraMap[roomKey];
    console.log(
      `Getting real-time stats for ${room} (ERA suffix: ${eraSuffix})`
    );

    const powerStats = getRoomPowerStats(eraSuffix);
    console.log("TempRoom power stats:", powerStats);

    console.log("Updated AC state:", acStates[room]);
  };

  // Add debug logging to the eraWidget onValues callback

  eraWidget.init.onValues = function (values) {
    console.log("=== ERA Widget Values Update Debug ===");
    console.log("Received values:", values);

    if (config25PM && values[config25PM.id]) {
      console.log(
        `Room ${roomKey} temproom value update:`,
        values[config25PM.id].value
      );
    }
    if (configPower && values[configPower.id]) {
      console.log(
        `Room ${roomKey} power value update:`,
        values[configPower.id].value
      );
    }
  };
  const valueAirMap = {
    "phòng họp lầu 3": valueAir1,
    "phòng họp lầu 4": valueAir2,
  };
  const updateRoomStats = () => {
    const powerStats = getRoomPowerStats(roomKey);

    const tempElement = document.getElementById(
      `temperature-${normalizedRoomKey}`
    );
    const humiElement = document.getElementById(
      `humidity-${normalizedRoomKey}`
    );

    if (tempElement) tempElement.textContent = powerStats.temp.toFixed(1);
    if (humiElement) humiElement.textContent = powerStats.humi.toFixed(2);

    console.log(`Updated ${roomKey} stats:`, powerStats);
  };

  // Lấy thời gian hiện tại
  const currentTime = new Date();
  const currentTimeStr = `${String(currentTime.getHours()).padStart(
    2,
    "0"
  )}:${String(currentTime.getMinutes()).padStart(2, "0")}`;

  // Tìm cuộc họp đang diễn ra
  const currentMeeting = filteredData.find((meeting) => {
    const startTime = meeting.startTime;
    const endTime = meeting.endTime;
    return currentTimeStr >= startTime && currentTimeStr <= endTime;
  });
  console.log("Current meeting:", currentMeeting);

  // Lọc các cuộc họp sắp diễn ra
  const upcomingMeetings = filteredData
    .filter((meeting) => {
      const startTime = meeting.startTime;
      return currentTimeStr <= startTime;
    })
    .sort((a, b) => {
      const timeA = a.startTime.split(":").map(Number);
      const timeB = b.startTime.split(":").map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  console.log("Upcoming meetings:", upcomingMeetings);
  setTimeout(() => {
    const container = document.querySelector(".container");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const acCard = e.target.closest(".ac-card");
      if (!acCard) return;

      // Normalize room name to lowercase
      const room = acCard.dataset.room.toLowerCase();

      // Use normalized room name
      const valueAir = valueAirMap[room];

      if (!valueAir) {
        console.error(`Không tìm thấy valueAir cho phòng: ${room}`);
        return;
      }

      // Kiểm tra và khởi tạo acStates nếu chưa có phòng này
      if (!acStates[room]) {
        acStates[room] = {
          isOn: false,
          roomTemperatures: 20,
          minTemp: 16,
          maxTemp: 30,
        };
      }

      // Chọn phần tử hiển thị nhiệt độ
      const tempDisplay = acCard.querySelector(".temperature-air");

      // Xử lý nút bật/tắt
      if (e.target.closest(".controls .btn:first-child")) {
        acStates[room].isOn = !acStates[room].isOn;
        updateACStatus(acCard, room);
      }

      // Xử lý giảm nhiệt độ
      if (e.target.closest(".controls .btn:nth-child(3)")) {
        if (
          acStates[room].isOn &&
          acStates[room].roomTemperatures > acStates[room].minTemp
        ) {
          acStates[room].roomTemperatures--;
          console.log("Decrease temperature", acStates[room].roomTemperatures);
          if (tempDisplay) {
            tempDisplay.textContent = `${acStates[room].roomTemperatures}°C`;
            eraWidget.triggerAction(valueAir.action, null, {
              value: acStates[room].roomTemperatures,
            });
          }
        }
      }

      // Xử lý tăng nhiệt độ
      if (e.target.closest(".btn-up")) {
        if (
          acStates[room].isOn &&
          acStates[room].roomTemperatures < acStates[room].maxTemp
        ) {
          acStates[room].roomTemperatures++;
          console.log("Increase temperature", acStates[room].roomTemperatures);
          if (tempDisplay) {
            tempDisplay.textContent = `${acStates[room].roomTemperatures}°C`;
            eraWidget.triggerAction(valueAir.action, null, {
              value: acStates[room].roomTemperatures,
            });
          }
        }
      }
    });
  }, 0);
  const suffix = roomSuffixMap[roomKey];
  const template = `
    <div class="container">
      <div class="left-panel">
        <div>
          <div class="clock-container">
            <div class="time-1" id="currentTime-1"></div>
          </div>
          <div class="currentDateElement-1" id="currentDate-1"></div>
        </div>
        <div>
          <div class="device online">
            <img
              alt="Power meter icon"
              height="30"
              src="https://storage.googleapis.com/a1aa/image/sp20aym45F4OONkBFWtn8r5qRfuruyCtUwgjpyI96eXQQdCUA.jpg"
              width="30"
            />
            <div>
              <div>Thông tin phòng họp</div>
                  <div>
                    Nhiệt độ: <span id="temperature-${normalizedRoomKey}">${powerStats.temp.toFixed(
    1
  )}</span> °C
                        Độ ẩm: <span id="humidity-${normalizedRoomKey}">${powerStats.humi.toFixed(
    2
  )}</span> %
                  </div>
            <div class="status">
              <i class="fas fa-circle"> </i>
              <div>
              <span> Online </span>
              </div>
            </div>
            </div>
          </div>
          <div class="ac-card"data-room="${roomName.toLowerCase()}">
            <div class="card-content">
              <img alt="Air conditioner icon" height="30" src="https://storage.googleapis.com/a1aa/image/njDqCVkQeJWBSiJfuEdErKceXH7wtLOLqr3glGdBuqpkg6EoA.jpg" width="30" />
              <div class="main-content">
                <h3 class="title">Máy lạnh ${roomName}</h3>

                <div class="controls">
                  <button class="btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" stroke-width="2" />
                    </svg>
                  </button>
                  <div class="divider"></div>
                  <button class="btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19 9l-7 7-7-7" stroke-width="2" />
                    </svg>
                  </button>
                  <span class="temperature-air" id="temperature-${roomName}">${
    acStates[roomKey].roomTemperatures
  }°C</span>
                  <button class="btn-up">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M5 15l7-7 7 7" stroke-width="2" />
                    </svg>
                  </button>
                </div>

                <div class="status-air">
                  <div class="status-air-dot"></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="home-button">
          <i class="fas fa-home"></i> TRANG CHỦ
        </button>
      </div>
      <div class="main-panel">
        <div>
          <h1>${currentMeeting ? currentMeeting.room : roomName}</h1>
          <div class="current-status">HIỆN TẠI</div>
          <div class="meeting-title-1">${
            currentMeeting ? currentMeeting.content : "Không có cuộc họp"
          }</div>
          <div class="meeting-time-1">
            <div role="cell">
              <span>Bắt đầu: ${
                currentMeeting ? currentMeeting.startTime : "--:--"
              }</span>
              <span> - Kết thúc: ${
                currentMeeting ? currentMeeting.endTime : "--:--"
              }</span>
            </div>
          </div>
          <div class="purpose">MỤC ĐÍCH SỬ DỤNG</div>
          <div class="purpose-value">${
            currentMeeting ? currentMeeting.purpose : "Chưa xác định"
          }</div>
        </div>
        <button class="end-meeting">END MEETING</button>
      </div>
      <div class="right-panel">
        <h2>LỊCH HỌP PHÒNG ${roomName.toUpperCase()}</h2>
        ${upcomingMeetings
          .map(
            (meeting) => `
          <div class="upcoming-meeting">
            <div class="meeting-title">${meeting.content}</div>
            <div class="meeting-time-1">${meeting.startTime} - ${meeting.endTime}</div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
  // Set up continuous updates
  setTimeout(() => {
    console.log(`Setting up continuous updates for ${roomKey}`);

    // Chạy update ngay lập tức
    updateRoomStats();

    // Set up interval cho updates liên tục
    roomUpdateIntervals[roomKey] = setInterval(updateRoomStats, 1000);

    // Cleanup khi container bị remove
    const container = document.getElementById(`room-${roomKey}-container`);
    if (container) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.removedNodes.length > 0) {
            clearInterval(roomUpdateIntervals[roomKey]);
            delete roomUpdateIntervals[roomKey];
            observer.disconnect();
            console.log(`Cleaned up updates for ${roomKey}`);
          }
        });
      });

      observer.observe(container.parentNode, {
        childList: true,
        subtree: true,
      });
    }
  }, 0);

  return template;
}

// Hàm chính để load trang động
function loadDynamicPage(pageType) {
  console.log("Loading dynamic page for:", pageType);

  const dynamicContent = document.getElementById("dynamicPageContent");
  const mainContent = document.querySelector(".content-wrapper");

  if (!dynamicContent || !mainContent) {
    console.error("Required elements not found!");
    return;
  }

  try {
    const cachedData = localStorage.getItem("fileCache");

    if (!cachedData) {
      console.error("No cached data found! Loading default template.");
      dynamicContent.innerHTML = renderRoomPage([], "", roomName);
      return;
    }
    const parsed = JSON.parse(cachedData);
    const data = Array.isArray(parsed?.data) ? parsed.data : [];
    console.log("Loaded data from cache:", data);

    let roomKeyword, roomName;
    switch (pageType) {
      case "room1":
        roomKeyword = "Phòng họp lầu 3";
        roomName = "Phòng họp lầu 3";
        break;
      case "room2":
        roomKeyword = "Phòng họp lầu 4";
        roomName = "Phòng họp lầu 4";
        break;
      default:
        console.error("Unknown room type:", pageType);
        return;
    }

    // Render trang
    dynamicContent.innerHTML = renderRoomPage(data, roomKeyword, roomName);

    // Cập nhật đồng hồ
    const currentTimeElement = document.getElementById("currentTime-1");
    const currentDateElement = document.getElementById("currentDate-1");

    const updateTimeAndDate = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const day = now.toLocaleString("vi-VN", { weekday: "long" });
      const date = now.toLocaleDateString("vi-VN");

      if (currentTimeElement && currentDateElement) {
        currentTimeElement.textContent = `${hours}:${minutes}`;
        currentDateElement.textContent = `${day}, ${date}`;
      }
    };

    // Khởi tạo đồng hồ
    updateTimeAndDate();
    const timeInterval = setInterval(updateTimeAndDate, 60000);

    // Hiển thị trang động
    dynamicContent.style.display = "block";
    mainContent.style.display = "none";

    // Xử lý nút Home
    const homeButton = dynamicContent.querySelector(".home-button");
    if (homeButton) {
      homeButton.addEventListener("click", () => {
        clearInterval(timeInterval);
        dynamicContent.style.display = "none";
        mainContent.style.display = "flex";
      });
    }
  } catch (error) {
    console.error("Error loading dynamic page:", error);
    // Fallback to empty data
    dynamicContent.innerHTML = renderRoomPage([], "", roomName);
  }
}

//======================End Meeting Feature==================
function setupEndMeetingHandlers() {
  const dynamicContent = document.getElementById("dynamicPageContent");
  if (!dynamicContent) return;

  // Xóa event listener cũ nếu có
  const oldHandler = dynamicContent._endMeetingHandler;
  if (oldHandler) {
    dynamicContent.removeEventListener("click", oldHandler);
  }

  // Tạo handler mới
  const newHandler = function (event) {
    if (event.target.classList.contains("end-meeting")) {
      handleEndMeeting(event);
    }
  };

  // Lưu và thêm handler mới
  dynamicContent._endMeetingHandler = newHandler;
  dynamicContent.addEventListener("click", newHandler);
}
// Thêm hàm kiểm tra trạng thái kết thúc của cuộc họp
function isValidMeetingState(meeting, currentTime) {
  if (!meeting) return false;

  // Nếu cuộc họp đã được đánh dấu kết thúc, luôn trả về false
  if (meeting.isEnded) return false;

  // Kiểm tra thời gian hiện tại có nằm trong khoảng thời gian họp hay không
  const isTimeValid =
    currentTime >= meeting.startTime && currentTime <= meeting.endTime;

  return isTimeValid;
}

function handleEndMeeting(event) {
  // Hiển thị hộp thoại xác nhận
  const cachedData = JSON.parse(localStorage.getItem("fileCache"));
  if (!cachedData || !cachedData.data) {
    console.error("No meeting data found!");
    return;
  }

  const data = cachedData.data;
  const currentTime = getCurrentTime();
  const currentDate = getCurrentDate();
  const roomName = event.target
    .closest(".main-panel")
    .querySelector("h1").textContent;

  // Tìm cuộc họp hiện tại
  const roomMeetings = data.filter(
    (meeting) =>
      meeting.room.toLowerCase().replace(/\s+/g, "-") &&
      meeting.date === currentDate
  );

  const currentMeeting = roomMeetings.find((meeting) =>
    isValidMeetingState(meeting, currentTime)
  );

  if (currentMeeting) {
    const updatedData = [...data];
    const currentMeetingIndex = updatedData.findIndex(
      (meeting) => meeting.id === currentMeeting.id
    );

    if (currentMeetingIndex !== -1) {
      // Cập nhật thông tin cuộc họp với flag đặc biệt
      updatedData[currentMeetingIndex] = {
        ...currentMeeting,
        endTime: currentTime,
        isEnded: true,
        lastUpdated: new Date().getTime(),
        originalEndTime: currentMeeting.endTime,
        forceEndedByUser: true, // Thêm flag mới để đánh dấu cuộc họp đã được kết thúc bởi người dùng
      };

      // Cập nhật cache và localStorage
      fileCache.data = updatedData;
      fileCache.lastModified = new Date().getTime();

      localStorage.setItem(
        "fileCache",
        JSON.stringify({
          data: updatedData,
          lastModified: fileCache.lastModified,
        })
      );

      // Lọc lại các cuộc họp trong ngày
      const todayMeetings = updatedData.filter((meeting) => {
        const meetingDate = new Date(
          meeting.date.split("/").reverse().join("-")
        );
        const currentDateObj = new Date(
          currentDate.split("/").reverse().join("-")
        );
        return meetingDate.toDateString() === currentDateObj.toDateString();
      });

      // Cập nhật giao diện
      updateRoomStatus(updatedData);
      updateScheduleTable(todayMeetings);
      renderRoomPage(
        updatedData,
        roomName.toLowerCase().replace(/\s+/g, "-"),
        roomName.toLowerCase().replace(/\s+/g, "-")
      );

      console.log(`Meeting ended early:`, {
        room: roomName,
        originalEndTime: currentMeeting.endTime,
        actualEndTime: currentTime,
        isEnded: true,
        forceEndedByUser: true,
      });
    }
  }
}

// Đảm bảo handlers được setup khi DOM ready
document.addEventListener("DOMContentLoaded", setupEndMeetingHandlers);
// Thêm sự kiện cho nút "End Meeting"
document.addEventListener("DOMContentLoaded", function () {
  const dynamicContent = document.getElementById("dynamicPageContent");

  dynamicContent.addEventListener("click", function (event) {
    if (event.target.classList.contains("end-meeting")) {
      handleEndMeeting(event);
      const isConfirmed = confirm(
        "Bạn có chắc chắn muốn kết thúc cuộc họp này không?"
      );

      // Nếu người dùng chọn "No", thoát khỏi hàm
      if (!isConfirmed) {
        console.log("Reject end meeting");
        return;
      }
    }
  });
});

// Thêm CSS cho styling
const style = document.createElement("style");
style.textContent = `
  .controls .btn.active {
    color: white;
  }
  .status-air-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ff0000;
    margin-right: 5px;
  }
`;
document.head.appendChild(style);

//====================E-Ra Servies==================
function sanitizeRoomName(room) {
  return room.toLowerCase().replace(/\s+/g, "-");
}
let latestValues = {};
let roomTemperatures = {
  "Phòng họp lầu 3": 20,
  "Phòng họp lầu 4": 20,
};
const eraWidget = new EraWidget();
// Lấy các phần tử HTML dựa trên ID, liên kết với giao diện người dùng
const temp = document.getElementById("temperature-eRa");
const humi = document.getElementById("humidity-eRa");
const pm25Index = document.getElementById("current-eRa");
const pm10Index = document.getElementById("voltage-eRa");

const temp2 = document.getElementById("temperature-eRa2");
const humi2 = document.getElementById("humidity-eRa2");
const currentIndex2 = document.getElementById("current-eRa2");
const powerIndex2 = document.getElementById("power-eRa2");

const airConditioner = document.getElementById("temperature-airConditioner");
const airConditioner2 = document.getElementById("temperature-airConditioner");

let currentACTemperature = 20; // Giá trị mặc định
let configTemp = null,
  configHumi = null,
  config25PM = null,
  config10PM = null,
  configPower = null,
  configTemp2 = null,
  configHumi2 = null,
  // configCurrent2 = null,
  // configPower2 = null,
  configAirConditioner = null,
  configAirConditioner2 = null,
  actionOff1 = null,
  actionOff2 = null,
  actionOn1 = null,
  actionOn2 = null,
  valueAir1 = null,
  valueAir2 = null,
  configPeopleDetection1 = null, //Lầu 3
  configPeopleDetection2 = null;

eraWidget.init({
  onConfiguration: (configuration) => {
    // Lưu các cấu hình khi nhận được từ widget
    configTemp = configuration.realtime_configs[0];
    configHumi = configuration.realtime_configs[1];
    config25PM = configuration.realtime_configs[2];
    config10PM = configuration.realtime_configs[3];
    configPeopleDetection1 = configuration.realtime_configs[4];
    configAirConditioner = configuration.realtime_configs[5];
    configTemp2 = configuration.realtime_configs[6];
    configHumi2 = configuration.realtime_configs[7];
    // configCurrent2 = configuration.realtime_configs[6];
    // configPower2 = configuration.realtime_configs[7];
    configAirConditioner2 = configuration.realtime_configs[8];
    // People detection sensors
    configPeopleDetection2 = configuration.realtime_configs[9];
    configAirConditioner2 = configuration.realtime_configs[10];
    // People detection sensors
    configPeopleDetection2 = configuration.realtime_configs[11];
    configAirConditioner2 = configuration.realtime_configs[12];
    // People detection sensors
    configPeopleDetection2 = configuration.realtime_configs[13];

    acActions["Phòng họp lầu 3"].on = configuration.actions[0];
    acActions["Phòng họp lầu 3"].off = configuration.actions[1];

    acActions["Phòng họp lầu 4"].on = configuration.actions[2];
    acActions["Phòng họp lầu 4"].off = configuration.actions[3];

    valueAir1 = configuration.actions[4];
    valueAir2 = configuration.actions[5];

    setTimeout(() => {
      // Add visual feedback for UI updates
      document.querySelectorAll(".btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          this.classList.add("btn-feedback");
          setTimeout(() => this.classList.remove("btn-feedback"), 300);
        });
      });
    }, 500);
  },
  // Hàm lấy giá trị từ các ID và cập nhật giao diện
  onValues: (values) => {
    console.log("Configuration:", {
      configTemp,
      configHumi,
      config25PM,
      config10PM,
      configPower,

      configTemp2,
      configHumi2,
      // configCurrent2,
      // configPower2,

      configAirConditioner,
      configAirConditioner2,
    });

    console.log("Actions initialized:", {
      actionOn1,
      actionOff1,
      actionOn2,
      actionOff2,
    });

    console.log("Current values:", values);

    console.log("Received new values from ERA:", values);
    latestValues = values; // Store latest values
    // Create a function to update room elements
    const updateRoomElements = (roomKey, current, power) => {
      const eraSuffix = roomEraMap[roomKey];
      const currentElement = document.getElementById(`current-${eraSuffix}`);
      const powerElement = document.getElementById(`power-${eraSuffix}`);

      if (currentElement && current !== undefined) {
        currentElement.textContent = current.toFixed(1);
        console.log(`Updated ${roomKey} current: ${current}A`);
      }

      if (powerElement && power !== undefined) {
        powerElement.textContent = power.toFixed(2);
        console.log(`Updated ${roomKey} power: ${power}KW`);
      }
    };
    if (configTemp && values[configTemp.id]) {
      const tempValue = values[configTemp.id].value;
      if (temp) temp.textContent = tempValue;
    }

    if (configHumi && values[configHumi.id]) {
      const humidValue = values[configHumi.id].value;
      if (humi) humi.textContent = humidValue;
    }

    if (config25PM && values[config25PM.id]) {
      updateRoomElements(
        " Phòng họp lầu 3",
        values[config25PM.id].value,
        values[config10PM?.id]?.value
      );
    }

    if (config25PM && values[config25PM.id]) {
      const pm25Value = values[config25PM.id].value;
      if (pm25Index) pm25Index.textContent = pm25Value;
    }

    if (config10PM && values[config10PM.id]) {
      const pm10Value = values[config10PM.id].value;
      if (pm10Index) pm10Index.textContent = pm10Value;
    }

    if (configTemp2 && values[configTemp2.id]) {
      const tempValue2 = values[configTemp2.id].value;
      if (temp2) temp2.textContent = tempValue2;
    }

    if (configHumi2 && values[configHumi2.id]) {
      const humidValue2 = values[configHumi2.id].value;
      if (humi2) humi2.textContent = humidValue2;
    }

    // Lavender 1 Room
    // if (configCurrent2 && values[configCurrent2.id]) {
    //   updateRoomElements(
    //     "Phòng họp lầu 4",
    //     values[configCurrent2.id].value,
    //     values[configPower2?.id]?.value
    //   );
    // }

    // if (configPower2 && values[configPower2.id]) {
    //   const powerValue2 = values[configPower2.id].value;
    //   if (powerIndex2) powerIndex2.textContent = powerValue2;
    // }

    if (configAirConditioner && values[configAirConditioner.id]) {
      const airValue1 = values[configAirConditioner.id].value;
      roomTemperatures["Phòng họp lầu 3"] = parseFloat(airValue1);
    }
    if (configAirConditioner2 && values[configAirConditioner2.id]) {
      const airValue2 = values[configAirConditioner2.id].value;
      roomTemperatures["Phòng họp lầu 4"] = parseFloat(airValue2);
    }

    if (configPeopleDetection1 && values[configPeopleDetection1.id]) {
      PeopleDetectionSystem.updateStatus(
        "Phòng họp lầu 3",
        values[configPeopleDetection1.id].value
      );
      console.log(
        "Phòng họp lầu 3 have a people detection value:",
        values[configPeopleDetection1.id].value
      );
    }

    if (configPeopleDetection2 && values[configPeopleDetection2.id]) {
      PeopleDetectionSystem.updateStatus(
        "Phòng họp lầu 4",
        values[configPeopleDetection2.id].value
      );
    }

    // Update all active rooms
    Object.keys(roomUpdateIntervals).forEach((roomKey) => {
      const eraSuffix = roomEraMap[roomKey];
      const currentElement = document.getElementById(`current-${eraSuffix}`);
      const powerElement = document.getElementById(`power-${eraSuffix}`);

      if (currentElement && powerElement) {
        if (config25PM && values[config25PM.id]) {
          currentElement.textContent = values[config25PM.id].value.toFixed(1);
        }
        if (configPower && values[configPower.id]) {
          powerElement.textContent = values[configPower.id].value.toFixed(2);
        }
      }
    });
    return latestValues;
  },
});

//=================Air Conditioner =================
let updateIntervals = {};

function updateACStatus(container, room) {
  const roomKey = normalizeRoomKey(room);
  const eraSuffix = roomEraMap[roomKey];
  const powerStats = getRoomPowerStats(eraSuffix);

  // Get all UI elements
  const statusDot = container.querySelector(".status-air-dot");
  const statusText = container.querySelector(".status-air span");
  const powerButton = container.querySelector(".controls .btn");
  const tempDisplay = container.querySelector(".temperature-air");

  // Debug: Log UI elements
  console.log(`[DEBUG] UI Elements for ${room}:`, {
    statusDot: !!statusDot,
    statusText: !!statusText,
    powerButton: !!powerButton,
    tempDisplay: !!tempDisplay,
  });

  // Create status monitor function
  const updateStatusIndicators = () => {
    try {
      // Get current power consumption
      const currentPower = powerStats?.current || 0;
      console.log(`[DEBUG] Power consumption for ${room}: ${currentPower}W`);

      // Determine AC state based on multiple factors
      const isPowerOn = currentPower > 0.5; // Hardware is consuming power
      const isLogicallyOn = acStates[roomKey]?.isOn || false; // Software state

      // Priority logic: Use power consumption as primary indicator
      // but also consider software state for immediate feedback
      const isActuallyRunning = isLogicallyOn || isPowerOn;

      // Update internal state
      acStates[roomKey].isOn = isActuallyRunning;
      acStates[roomKey].powerConsumption = currentPower;

      // Update UI elements with null checks
      if (statusDot && statusText) {
        if (isActuallyRunning) {
          statusDot.style.backgroundColor = "#4CAF50";
          statusText.textContent = "Online";
        } else {
          statusDot.style.backgroundColor = "#ff0000";
          statusText.textContent = "Offline";
        }
      }

      if (powerButton) {
        if (isActuallyRunning) {
          powerButton.classList.add("active");
          powerButton.style.backgroundColor = "#4CAF50";
        } else {
          powerButton.classList.remove("active");
          powerButton.style.backgroundColor = "#6c757d";
        }
      }

      // Update temperature display
      if (tempDisplay) {
        if (isActuallyRunning) {
          const currentTemp = acStates[roomKey]?.roomTemperatures || 25;
          tempDisplay.textContent = `${currentTemp}°C`;
        } else {
          tempDisplay.textContent = "OFF";
        }
      }

      console.log(
        `[STATUS] AC ${room}: ${
          isActuallyRunning ? "ON" : "OFF"
        } | Power: ${currentPower}W`
      );
    } catch (error) {
      console.error(`[ERROR] Failed to update status for ${room}:`, error);
    }
  };

  // Initial update
  updateStatusIndicators();

  // Set up continuous monitoring with error handling
  const monitoringInterval = setInterval(() => {
    try {
      updateStatusIndicators();
    } catch (error) {
      console.error(`[ERROR] Monitoring error for ${room}:`, error);
    }
  }, 2000); // Reduce frequency to 2 seconds for better performance

  // Clean up when container is removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if ([...mutation.removedNodes].includes(container)) {
        clearInterval(monitoringInterval);
        observer.disconnect();
        console.log(`[CLEANUP] Monitoring stopped for ${room}`);
      }
    });
  });

  observer.observe(container.parentNode, { childList: true });

  return monitoringInterval;
}
// Helper function to get room temperature
function getRoomTemperature(roomKey) {
  try {
    // Replace this with your actual temperature reading logic
    // This could be from sensors, era data, or other sources
    const eraSuffix = roomEraMap[roomKey];
    // Example: return eraWidget.getTemperature(eraSuffix);

    // For now, return mock temperature
    return Math.floor(Math.random() * 5) + 23; // 23-27°C
  } catch (error) {
    console.error(`Failed to get temperature for ${roomKey}:`, error);
    return null;
  }
}
function capitalizeFirst(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Update updatePeopleStatus function
function updatePeopleStatus(room, value) {
  const roomKey = normalizeRoomKey(room);
  const isEmpty = value === 1;

  if (peopleDetectionStates[roomKey].isEmpty !== isEmpty) {
    peopleDetectionStates[roomKey].isEmpty = isEmpty;

    const roomSection = findRoomSection(capitalizeFirst(roomKey));
    if (roomSection) {
      const peopleIndicator = roomSection.querySelector(".people-indicator");
      const peopleDot = peopleIndicator?.querySelector(".people-dot");
      const statusText = peopleIndicator?.querySelector(".people-status-text");

      if (peopleDot && statusText) {
        peopleDot.classList.toggle("occupied", !isEmpty);
        statusText.textContent = isEmpty ? "Phòng trống" : "Có người";

        // Add animation
        peopleDot.classList.add("status-update");
        setTimeout(() => peopleDot.classList.remove("status-update"), 500);

        console.log(
          `People detection status updated for ${room}: ${
            isEmpty ? "Empty" : "Occupied"
          }`
        );
      }
    }
  }
}

// Add this utility function at the top of your file
function findRoomSection(roomName) {
  const sections = document.querySelectorAll(".room-section");
  console.debug(`Searching for room: ${roomName}`);
  console.debug(`Found ${sections.length} room sections`);

  const found = Array.from(sections).find((section) => {
    const normalizeName = (name) =>
      name.toLowerCase().replace(/\s+/g, " ").trim();

    const roomNumber = section.querySelector(".room-number");
    const roomText = roomNumber ? normalizeName(roomNumber.textContent) : "";
    const match = roomText === normalizeName(roomName);

    console.debug(
      `Checking section: ${roomNumber?.textContent.trim()} -> ${match}`
    );
    return match;
  });

  if (!found) {
    console.warn(`No section found for room: ${roomName}`);
  }
  return found;
}

const PeopleDetectionSystem = {
  // State management
  states: {
    "Phòng họp lầu 3": { isEmpty: true },
    "Phòng họp lầu 4": { isEmpty: true },
  },

  // Configuration mapping
  config: {
    "Phòng họp lầu 3": { sensorId: 4 },
    "Phòng họp lầu 4": { sensorId: 16 },
  },

  // Room name normalization
  normalizeRoomDisplay(roomKey) {
    const names = {
      "P.HỌP LẦU 3": "Phòng họp lầu 3",
      "Phòng họp lầu 4": "Phòng họp lầu 4",
    };
    return names[roomKey] || roomKey;
  },

  // System initialization
  initialize() {
    console.log("Initializing People Detection System...");
    this.validateRoomStructure();

    Object.keys(this.states).forEach((roomKey) => {
      console.log(
        `Initializing state for ${this.normalizeRoomDisplay(roomKey)}`
      );
      this.updateUI(roomKey, this.states[roomKey].isEmpty);
    });

    console.log("People Detection System initialized");
  },

  // Structure validation
  validateRoomStructure() {
    Object.keys(this.states).forEach((roomKey) => {
      const room = this.normalizeRoomDisplay(roomKey);
      const section = findRoomSection(room);

      if (!section) {
        console.error(`Room section missing: ${room}`);
        return;
      }

      this.validateRoomElements(section, room);
    });
  },

  // Element validation
  validateRoomElements(section, room) {
    const required = {
      peopleIndicator: ".people-indicator",
      dot: ".people-dot",
      statusText: ".people-status-text",
    };

    const missing = Object.entries(required)
      .filter(([_, selector]) => !section.querySelector(selector))
      .map(([name]) => name);

    if (missing.length > 0) {
      console.error(`Missing elements for ${room}:`, missing);
    }
  },

  updateStatus(roomKey, value) {
    let isEmpty = value === 1; // Assuming 1 means empty, 0 means occupied
    console.log(`People detection update for ${roomKey}: ${value}`);
    // Convert sensor value to room status (0 = occupied, 1 = empty)
    const roomMap = {
      "P.HỌP LẦU 3": "Phòng họp lầu 3",
      "P.HỌP LẦU 4": "Phòng họp lầu 4",
    };

    const normalizedRoom = roomMap[roomKey] || roomKey;

    if (this.states[normalizedRoom]?.isEmpty !== isEmpty) {
      this.states[normalizedRoom].isEmpty = isEmpty;
      this.updateUI(normalizedRoom, isEmpty);
    }
  },

  updateUI(roomKey, isEmpty) {
    const room = capitalizeFirst(this.normalizeRoomDisplay(roomKey));
    const section = findRoomSection(room);

    if (!section) {
      console.warn(`Room section not found: ${room}`);
      return;
    }

    // Get all required elements
    const peopleIndicator = section.querySelector(".people-indicator");
    if (!peopleIndicator) {
      console.warn(`People indicator not found for ${room}`);
      return;
    }

    // Directly target the status text element
    const statusText = peopleIndicator.querySelector(".people-status-text");
    const dot = peopleIndicator.querySelector(".people-dot");

    if (statusText && dot) {
      // Update status text using textContent
      statusText.textContent = isEmpty ? "Phòng trống" : "Có người";

      // Update dot color
      dot.style.backgroundColor = isEmpty ? "#4CAF50" : "#ff0000";

      // Add animation
      dot.classList.remove("status-update");
      void dot.offsetWidth; // Force reflow
      dot.classList.add("status-update");

      console.log(`Updated ${room} status text to: ${statusText.textContent}`);
    } else {
      console.error(`Missing elements for ${room}:`, {
        hasStatusText: !!statusText,
        hasDot: !!dot,
      });
    }
  },
  // Visual indicator update
  updateIndicators(dot, text, isEmpty) {
    dot.style.backgroundColor = isEmpty ? "#ff0000" : "#4CAF50";
    text.textContent = isEmpty ? "Phòng trống" : "Có người";

    // Add animation
    dot.classList.remove("status-update");
    void dot.offsetWidth; // Trigger reflow
    dot.classList.add("status-update");
  },
};
