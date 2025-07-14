// Utility for CSS and DOM enhancements

export function injectCustomStyles() {
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
}

export function addFontAwesome() {
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.rel = "stylesheet";
    fontAwesomeLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
    document.head.appendChild(fontAwesomeLink);
  }
}
