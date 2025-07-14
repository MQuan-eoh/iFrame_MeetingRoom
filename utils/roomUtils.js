// Room utility functions for meeting room dashboard

export function formatRoomName(room) {
  if (!room) return "";
  const normalized = String(room)
    .toLowerCase()
    .replace(
      /[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/(p\.?|phòng)\s*/g, "phòng ")
    .replace(/(lau|lầu)/g, "lầu")
    .trim();
  const mapping = {
    "phòng họp lầu 3": "Phòng họp lầu 3",
    "phòng họp lầu 4": "Phòng họp lầu 4",
    "phong hop lau 3": "Phòng họp lầu 3",
    "p hop lau 3": "Phòng họp lầu 3",
    "p.hop lau 3": "Phòng họp lầu 3",
  };
  return mapping[normalized] || room;
}

export function normalizeRoomName(roomname) {
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

export function normalizeRoomKey(roomName) {
  return roomName.toLowerCase().replace(/\s+/g, " ").trim();
}
