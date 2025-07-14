// DOM utility functions for meeting room dashboard

export function showProgressBar(overlay) {
  const progressContainer = document.querySelector(".window");
  if (progressContainer) {
    progressContainer.classList.add("show");
    progressContainer.style.display = "block";
    if (overlay) overlay.style.display = "block";
  }
}

export function hideProgressBar(overlay) {
  const progressContainer = document.querySelector(".window");
  if (progressContainer) {
    progressContainer.classList.remove("show");
    progressContainer.style.display = "none";
    if (overlay) overlay.style.display = "none";
  }
}

export function updateProgress(percent, statusText) {
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const progressStatus = document.getElementById("progressStatus");
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}%`;
  if (progressStatus) progressStatus.textContent = statusText;
}
