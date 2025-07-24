// Microsoft Graph API integration for OneDrive synchronization
//============One Drive Feature================
let oneDriveSync = null;
// Initialize OneDrive integration
function initializeOneDriveSync() {
  console.log("[App] Initializing OneDrive integration...");

  // Only initialize if the MSAL library is available
  loadMicrosoftLibraries()
    .then(() => {
      oneDriveSync = new OneDriveSync();

      oneDriveSync
        .init({
          fileName: "MeetingSchedule.xlsx", // Your Excel filename
          pollingInterval: 10000, // Check every 10 seconds
          onFileChanged: async (file) => {
            console.log("[OneDrive] File changed, processing...");

            // Show progress indicator
            showProgressBar();
            updateProgress(10, "Detected file change in OneDrive...");

            try {
              // Use your existing file processing logic
              await handleFileUpload(file);

              // Show success notification
              showOneDriveNotification("File synchronized from OneDrive");
            } catch (error) {
              console.error("[OneDrive] Error processing synced file:", error);
              showOneDriveNotification("Error synchronizing file", true);
            }
          },
          onSyncError: (message, error) => {
            console.error(`[OneDrive] Sync error: ${message}`, error);
            showOneDriveNotification("OneDrive sync error", true);
          },
          onSyncSuccess: (message) => {
            console.log(`[OneDrive] ${message}`);
          },
        })
        .catch((error) => {
          console.error(
            "[OneDrive] Failed to initialize OneDrive sync:",
            error
          );
        });
    })
    .catch((error) => {
      console.error("Failed to load Microsoft libraries:", error);
    });
}

// Helper function to load Microsoft libraries
function loadMicrosoftLibraries() {
  return new Promise((resolve, reject) => {
    // Check if MSAL is already loaded
    if (window.msal) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Show OneDrive notification
function showOneDriveNotification(message, isError = false) {
  const notification = document.createElement("div");
  notification.className =
    "onedrive-sync-notification" + (isError ? " error" : "");
  notification.innerHTML = `
    <i class="fas ${isError ? "fa-exclamation-triangle" : "fa-sync-alt"}"></i>
    ${message}
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("hide");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

// Add this function to your existing document.addEventListener("DOMContentLoaded",...) block

function addOneDriveSyncUI() {
  const settingsContent = document.querySelector(".settings-content");
  if (!settingsContent) return;

  const oneDriveSection = document.createElement("div");
  oneDriveSection.className = "onedrive-section";
  oneDriveSection.innerHTML = `
    <div class="onedrive-header">
      <i class="fab fa-microsoft"></i> OneDrive Sync
      <div class="onedrive-status">
        <span class="status-dot"></span>
        <span class="status-text">Disconnected</span>
      </div>
    </div>
    <div class="onedrive-controls">
      <button class="onedrive-connect-btn">Connect</button>
      <button class="onedrive-sync-btn" disabled>Sync Now</button>
    </div>
    <div class="onedrive-info">
      <div class="file-name">No file selected</div>
      <div class="last-sync">Never synced</div>
    </div>
  `;

  settingsContent.appendChild(oneDriveSection);

  // Add styles
  const oneDriveUIStyle = document.createElement("style");
  oneDriveUIStyle.textContent = `
    .onedrive-sync-btn.syncing {
    background-color: #ffc107;
    color: #212529;
    position: relative;
    }
    .onedrive-sync-btn.syncing:after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top-color: #212529;
      border-radius: 50%;
      right: 8px;
      top: 50%;
      margin-top: -6px;
      animation: sync-spinner 1s linear infinite;
    }

    @keyframes sync-spinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .onedrive-section {
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    
    .onedrive-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: 500;
    }
    
    .onedrive-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.9em;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ff0000;
    }
    
    .status-dot.connected {
      background-color: #4CAF50;
    }
    
    .onedrive-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .onedrive-controls button {
      padding: 8px 12px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    
    .onedrive-connect-btn {
      background-color: #0078d4;
      color: white;
    }
    
    .onedrive-sync-btn {
      background-color: #6c757d;
      color: white;
    }
    
    .onedrive-sync-btn:not([disabled]) {
      background-color: #28a745;
    }
    
    .onedrive-info {
      font-size: 0.9em;
      color: #555;
    }
    
    .file-name {
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(oneDriveUIStyle);

  // Set up event handlers
  const connectBtn = oneDriveSection.querySelector(".onedrive-connect-btn");
  const syncBtn = oneDriveSection.querySelector(".onedrive-sync-btn");

  connectBtn.addEventListener("click", async () => {
    if (!oneDriveSync) {
      initializeOneDriveSync();
      return;
    }

    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";

    try {
      await oneDriveSync.signIn();
      await oneDriveSync.findFileId();

      updateOneDriveUI(true);
      oneDriveSync.startSyncPolling();
    } catch (error) {
      console.error("Failed to connect to OneDrive:", error);
      alert("Failed to connect to OneDrive. Please try again.");
    } finally {
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect";
    }
  });

  // Cập nhật event listener cho nút Sync Now
  syncBtn.addEventListener("click", async () => {
    if (!oneDriveSync) return;

    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    syncBtn.classList.add("syncing");

    try {
      // Gọi checkForChanges với force=true để bỏ qua kiểm tra thời gian
      await oneDriveSync.checkForChanges(true);

      // Update last sync time
      const lastSyncEl = oneDriveSection.querySelector(".last-sync");
      if (lastSyncEl) {
        lastSyncEl.textContent = `Last sync: ${new Date().toLocaleString()}`;
      }

      // Hiển thị thông báo đồng bộ thành công
      showOneDriveNotification("File synchronized successfully");
    } catch (error) {
      console.error("Failed to sync with OneDrive:", error);
      showOneDriveNotification("Failed to sync with OneDrive", true);
    } finally {
      syncBtn.disabled = false;
      syncBtn.textContent = "Sync Now";
      syncBtn.classList.remove("syncing");
    }
  });

  // Initial UI update if we have stored credentials
  if (oneDriveSync && oneDriveSync.authToken) {
    updateOneDriveUI(true);
  }
}

// Helper function to update the UI state
function updateOneDriveUI(isConnected) {
  const oneDriveSection = document.querySelector(".onedrive-section");
  if (!oneDriveSection) return;

  const statusDot = oneDriveSection.querySelector(".status-dot");
  const statusText = oneDriveSection.querySelector(".status-text");
  const connectBtn = oneDriveSection.querySelector(".onedrive-connect-btn");
  const syncBtn = oneDriveSection.querySelector(".onedrive-sync-btn");
  const fileNameEl = oneDriveSection.querySelector(".file-name");
  const lastSyncEl = oneDriveSection.querySelector(".last-sync");

  if (isConnected) {
    statusDot.classList.add("connected");
    statusText.textContent = "Connected";
    connectBtn.textContent = "Reconnect";
    syncBtn.disabled = false;

    if (oneDriveSync) {
      fileNameEl.textContent = `File: ${oneDriveSync.config.fileName}`;

      if (oneDriveSync.lastModifiedTime) {
        const lastModified = new Date(oneDriveSync.lastModifiedTime);
        lastSyncEl.textContent = `Last modified: ${lastModified.toLocaleString()}`;
      }
    }
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = "Disconnected";
    connectBtn.textContent = "Connect";
    syncBtn.disabled = true;
    fileNameEl.textContent = "No file selected";
    lastSyncEl.textContent = "Never synced";
  }
}

class OneDriveSync {
  constructor() {
    // Microsoft Graph API configuration
    this.config = {
      clientId: "4a87bff7-097b-4771-91fe-21a5ab64a6d8", // Register an app in Azure AD to get this
      redirectUri: "https://mquan-eoh.github.io/iFrame_MeetingRoom/",
      scopes: ["Files.Read", "Files.Read.All", "User.Read", "Sites.Read.All"],
      fileId: null, // Will store the OneDrive file ID once identified
      fileName: "MeetingSchedule.xlsx", // Default file name to look for
      filePath: "/Documents/", // Default path in OneDrive to check
    };

    this.isAuthenticated = false;
    this.authToken = null;
    this.refreshToken = null; // Store refresh token
    this.tokenExpiryTime = null; // Track token expiry
    this.lastModifiedTime = null;
    this.lastSyncTime = null; // Thêm để lưu thời gian đồng bộ gần nhất
    this.syncInterval = null;
    this.healthCheckInterval = null; // New interval for connection health check
    this.retryCount = 0;
    this.maxRetries = 5; // Increased retries
    this.pollingInterval = 10000; 
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.tokenRefreshBuffer = 300000; // Refresh token 5 minutes before expiry
    this.connectionHealthy = false;
    this.isSyncing = false; // Flag để theo dõi trạng thái đồng bộ

    // Event handlers
    this.onFileChanged = null;
    this.onSyncError = null;
    this.onSyncSuccess = null;
    this.onConnectionStatusChanged = null;

    // Check auth state and load stored credentials
    this.checkAuthState();
    this.loadStoredAuth();

    // Start monitoring connection health
    this.startHealthCheck();
  }

  startHealthCheck() {
    // Clear existing health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Set up new interval
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 60000); // Check every minute
  }

  async checkConnectionHealth() {
    console.log("[OneDrive] Performing connection health check...");

    try {
      if (!this.authToken || !this.isAuthenticated) {
        console.log("[OneDrive] No active session, attempting reconnect...");
        await this.reconnect();
        return;
      }

      // Check token expiry
      if (
        this.tokenExpiryTime &&
        new Date(this.tokenExpiryTime) - new Date() < this.tokenRefreshBuffer
      ) {
        console.log("[OneDrive] Token expiring soon, refreshing...");
        await this.refreshAccessToken();
      }

      // Verify connection with a simple API call
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        console.log("[OneDrive] Connection health check passed");

        if (!this.connectionHealthy) {
          this.connectionHealthy = true;
          if (this.onConnectionStatusChanged) {
            this.onConnectionStatusChanged(true, "Connection established");
          }
        }

        this.reconnectAttempts = 0;
      } else {
        console.warn(
          "[OneDrive] Connection health check failed, attempting to refresh token"
        );
        await this.refreshAccessToken();
      }
    } catch (error) {
      console.error("[OneDrive] Health check error:", error);
      this.connectionHealthy = false;

      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(false, "Connection lost");
      }

      await this.reconnect();
    }
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[OneDrive] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[OneDrive] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    try {
      await this.acquireToken();

      if (this.config.fileId) {
        // Verify file is still accessible
        await this.checkForChanges();
      } else if (this.config.fileName) {
        // Try to find file again
        await this.findFileId();
      }

      this.startSyncPolling();
      this.connectionHealthy = true;
      this.reconnectAttempts = 0;

      console.log("[OneDrive] Reconnection successful");
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(true, "Reconnected successfully");
      }
    } catch (error) {
      console.error("[OneDrive] Reconnection failed:", error);

      // Exponential backoff for retry
      const backoffTime = Math.min(
        30000,
        1000 * Math.pow(2, this.reconnectAttempts)
      );
      console.log(`[OneDrive] Will retry in ${backoffTime / 1000} seconds`);

      setTimeout(() => this.reconnect(), backoffTime);
    }
  }

  async checkAuthState() {
    try {
      const msalInstance = this.getMsalInstance();
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        this.isAuthenticated = true;
        // Tự động refresh token nếu cần
        await this.acquireToken();
      }
    } catch (error) {
      console.error("[OneDrive] Error checking auth state:", error);
    }
  }

  getMsalInstance() {
    if (!this.msalInstance) {
      const msalConfig = {
        auth: {
          clientId: this.config.clientId,
          redirectUri: this.config.redirectUri,
          //Change authority to consumer for personal accounts
          authority: "https://login.microsoftonline.com/common",
          navigateToLoginRequestUrl: true,
          postLogoutRedirectUri: this.config.redirectUri,
        },
        cache: {
          cacheLocation: "localStorage",
          storeAuthStateInCookie: true,
        },
        system: {
          allowNativeBroker: false, // Disable native broker
          loggerOptions: {
            logLevel: msal.LogLevel.Warning,
            piiLoggingEnabled: false,
          },
        },
      };

      this.msalInstance = new msal.PublicClientApplication(msalConfig);
    }
    return this.msalInstance;
  }

  // Trong class OneDriveSync, thêm/sửa phương thức init
  async init(options = {}) {
    console.log("[OneDrive] Initializing OneDrive sync...");

    try {
      // Apply custom options
      if (options.fileName) this.config.fileName = options.fileName;
      if (options.filePath) this.config.filePath = options.filePath;
      if (options.pollingInterval)
        this.pollingInterval = options.pollingInterval;
      if (options.onFileChanged) this.onFileChanged = options.onFileChanged;
      if (options.onSyncError) this.onSyncError = options.onSyncError;
      if (options.onSyncSuccess) this.onSyncSuccess = options.onSyncSuccess;
      if (options.onConnectionStatusChanged)
        this.onConnectionStatusChanged = options.onConnectionStatusChanged;

      // New option: silentMode
      const silentMode = options.silentMode === true;

      // Try to restore session
      if (!this.isAuthenticated || !this.authToken) {
        const accounts = this.getMsalInstance().getAllAccounts();

        if (accounts.length > 0) {
          console.log("[OneDrive] Restoring previous session");
          await this.acquireToken();
        } else if (!silentMode) {
          // Only attempt interactive sign-in if not in silent mode
          console.log(
            "[OneDrive] No previous session found, interactive sign-in required"
          );
          await this.signIn();
        } else {
          console.log(
            "[OneDrive] No previous session found and silent mode enabled, skipping auth"
          );
          throw new Error("Authentication required but silent mode enabled");
        }
      }

      // Get file ID if not already available
      if (!this.config.fileId) {
        // Try to get file ID from localStorage first
        const storedFileId = localStorage.getItem("oneDriveFileId");
        if (storedFileId) {
          this.config.fileId = storedFileId;
          console.log(`[OneDrive] Using stored file ID: ${this.config.fileId}`);
        } else if (this.isAuthenticated) {
          // Only find file ID if authenticated
          await this.findFileId();
        }
      }

      // Start polling for changes only if authenticated and have fileId
      if (this.isAuthenticated && this.config.fileId) {
        this.startSyncPolling();

        // Initialize connection status
        this.connectionHealthy = true;
        if (this.onConnectionStatusChanged) {
          this.onConnectionStatusChanged(true, "Connected");
        }
      }

      return true;
    } catch (error) {
      console.error("[OneDrive] Initialization failed:", error);
      if (this.onSyncError) {
        this.onSyncError("Failed to initialize OneDrive sync", error);
      }

      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(false, "Connection failed");
      }

      throw error;
    }
  }

  // Sign in to Microsoft Graph API
  async signIn() {
    try {
      const msalInstance = this.getMsalInstance();

      // Attempt silent login first
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const silentRequest = {
            scopes: this.config.scopes,
            account: accounts[0],
            prompt: "none",
          };
          const response = await msalInstance.acquireTokenSilent(silentRequest);
          this.authToken = response.accessToken;
          this.isAuthenticated = true;
          return response;
        }
      } catch (silentError) {
        console.log("[Auth] Silent sign-in failed, trying popup", silentError);
      }

      //If silent login fails, use popup login
      const loginRequest = {
        scopes: this.config.scopes,
        prompt: "select_account",
        authority: "https://login.microsoftonline.com/consumers",
      };

      const loginResponse = await msalInstance.loginPopup(loginRequest);

      if (loginResponse) {
        this.authToken = loginResponse.accessToken;
        this.isAuthenticated = true;
        return loginResponse;
      }
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      throw error;
    }
  }
  // Find the file ID for the Excel file in OneDrive
  async findFileId() {
    try {
      const searchPath = `${this.config.filePath}${this.config.fileName}`;
      console.log(`[OneDrive] Searching for file: ${searchPath}`);

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/root:${encodeURIComponent(
          searchPath
        )}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to find file: ${response.statusText}`);
      }

      const data = await response.json();
      this.config.fileId = data.id;
      this.lastModifiedTime = data.lastModifiedDateTime;

      console.log(`[OneDrive] File found with ID: ${this.config.fileId}`);
      localStorage.setItem("oneDriveFileId", this.config.fileId);
      localStorage.setItem("oneDriveLastModified", this.lastModifiedTime);

      return this.config.fileId;
    } catch (error) {
      console.error("[OneDrive] Error finding file:", error);
      throw error;
    }
  }

  // Start polling for file changes
  startSyncPolling() {
    console.log(
      `[OneDrive] Starting sync polling every ${
        this.pollingInterval / 1000
      } seconds`
    );

    // Clear any existing polling
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up new polling interval
    this.syncInterval = setInterval(() => {
      this.checkForChanges().catch((error) => {
        console.error("[OneDrive] Error checking for changes:", error);
        this.retryCount++;

        if (this.retryCount >= this.maxRetries) {
          console.error(
            `[OneDrive] Max retries (${this.maxRetries}) reached, stopping polling`
          );
          this.stopSyncPolling();

          if (this.onSyncError) {
            this.onSyncError("Sync polling stopped due to errors", error);
          }
        }
      });
    }, this.pollingInterval);
  }

  // Stop polling
  stopSyncPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Check for file changes
  async checkForChanges(force = false) {
    if (!this.config.fileId || !this.authToken) {
      throw new Error("File ID or auth token not available");
    }

    try {
      console.log(
        `[OneDrive] Checking for changes to file: ${this.config.fileName}${
          force ? " (forced)" : ""
        }`
      );

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${this.config.fileId}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          // Thêm cache: 'no-store' để đảm bảo luôn nhận phiên bản mới nhất
          cache: "no-store",
        }
      );

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          console.log("[OneDrive] Token expired, refreshing...");
          await this.refreshToken();
          return this.checkForChanges(force);
        }
        throw new Error(`Failed to check file: ${response.statusText}`);
      }

      const data = await response.json();
      const newModifiedTime = data.lastModifiedDateTime;

      console.log(`[OneDrive] File last modified: ${newModifiedTime}`);
      console.log(
        `[OneDrive] Our last known modified time: ${this.lastModifiedTime}`
      );

      // Nếu force=true hoặc file đã được sửa đổi kể từ lần kiểm tra cuối cùng
      if (
        force ||
        !this.lastModifiedTime ||
        new Date(newModifiedTime) > new Date(this.lastModifiedTime)
      ) {
        if (force) {
          console.log("[OneDrive] Forced sync requested, downloading file...");
        } else {
          console.log(
            `[OneDrive] File changed! Last: ${this.lastModifiedTime}, New: ${newModifiedTime}`
          );
        }

        this.lastModifiedTime = newModifiedTime;
        localStorage.setItem("oneDriveLastModified", this.lastModifiedTime);

        // Download and process the updated file
        await this.downloadAndProcessFile();

        // Lưu thời gian đồng bộ mới nhất
        this.lastSyncTime = new Date();
        localStorage.setItem(
          "oneDriveLastSyncTime",
          this.lastSyncTime.toISOString()
        );
      } else {
        console.log("[OneDrive] No changes detected");
      }

      // Reset retry count on successful check
      this.retryCount = 0;

      if (this.onSyncSuccess) {
        this.onSyncSuccess("Sync check completed successfully");
      }

      return true;
    } catch (error) {
      console.error("[OneDrive] Error checking for changes:", error);
      throw error;
    }
  }

  // Download and process the file when changed
  async downloadAndProcessFile() {
    try {
      // Đặt flag đồng bộ
      this.isSyncing = true;

      // Cập nhật UI để hiển thị đang đồng bộ
      this.updateSyncingUI(true);

      console.log(`[OneDrive] Downloading file with ID: ${this.config.fileId}`);

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${this.config.fileId}/content`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          // Thêm cache: 'no-store' để đảm bảo lấy phiên bản mới nhất
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const file = new File([blob], this.config.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      console.log("[OneDrive] File downloaded successfully, processing...");

      // Call the file change handler with the downloaded file
      if (this.onFileChanged) {
        await this.onFileChanged(file);
      }

      // Cập nhật thời gian đồng bộ
      this.lastSyncTime = new Date();
      localStorage.setItem(
        "oneDriveLastSyncTime",
        this.lastSyncTime.toISOString()
      );

      // Cập nhật UI sau khi đồng bộ hoàn tất
      this.updateSyncingUI(false);

      return file;
    } catch (error) {
      console.error("[OneDrive] Error downloading file:", error);

      // Cập nhật UI khi có lỗi
      this.updateSyncingUI(false, true);

      if (this.onSyncError) {
        this.onSyncError("Failed to download updated file", error);
      }
      throw error;
    } finally {
      // Đảm bảo flag được reset
      this.isSyncing = false;
    }
  }

  async acquireToken() {
    try {
      const msalInstance = this.getMsalInstance();
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const result = await msalInstance.acquireTokenSilent({
        scopes: this.config.scopes,
        account: accounts[0],
      });

      this.authToken = result.accessToken;
      this.tokenExpiryTime = new Date(Date.now() + result.expiresIn * 1000);
      return result;
    } catch (error) {
      console.error("[Auth] Token acquisition failed:", error);
      // Nếu silent refresh thất bại, yêu cầu login lại
      return this.signIn();
    }
  }
  // Token management and storage
  storeAuthToken(authResponse) {
    localStorage.setItem("oneDriveAuthToken", authResponse.accessToken);
    localStorage.setItem(
      "oneDriveTokenExpiry",
      new Date(Date.now() + authResponse.expiresIn * 1000).toISOString()
    );
  }

  loadStoredAuth() {
    this.authToken = localStorage.getItem("oneDriveAuthToken");
    this.config.fileId = localStorage.getItem("oneDriveFileId");
    this.lastModifiedTime = localStorage.getItem("oneDriveLastModified");

    // Thêm để tải thời gian đồng bộ cuối cùng
    const lastSyncTime = localStorage.getItem("oneDriveLastSyncTime");
    if (lastSyncTime) {
      this.lastSyncTime = new Date(lastSyncTime);
    }

    // Check if token is expired
    const tokenExpiry = localStorage.getItem("oneDriveTokenExpiry");
    if (tokenExpiry && new Date(tokenExpiry) <= new Date()) {
      console.log("[OneDrive] Stored token expired");
      this.authToken = null;
    }
  }

  async refreshToken() {
    // For MSAL, we need to call acquireTokenSilent or trigger a new login
    try {
      await this.signIn();
    } catch (error) {
      console.error("[OneDrive] Failed to refresh token:", error);
      throw error;
    }
  }

  // Thêm phương thức để cập nhật UI khi đang đồng bộ
  updateSyncingUI(isSyncing, hasError = false) {
    // Nếu có event handler, gọi nó
    if (this.onConnectionStatusChanged) {
      if (isSyncing) {
        this.onConnectionStatusChanged(true, "Syncing...");
      } else if (hasError) {
        this.onConnectionStatusChanged(true, "Sync error");
      } else {
        this.onConnectionStatusChanged(true, "Connected");
      }
    }

    // Cập nhật UI trực tiếp (nếu cần)
    const oneDriveSection = document.querySelector(".onedrive-section");
    if (oneDriveSection) {
      const syncBtn = oneDriveSection.querySelector(".onedrive-sync-btn");
      const lastSyncEl = oneDriveSection.querySelector(".last-sync");

      if (syncBtn) {
        if (isSyncing) {
          syncBtn.disabled = true;
          syncBtn.textContent = "Syncing...";
          syncBtn.classList.add("syncing");
        } else {
          syncBtn.disabled = false;
          syncBtn.textContent = "Sync Now";
          syncBtn.classList.remove("syncing");
        }
      }

      if (lastSyncEl && this.lastSyncTime) {
        lastSyncEl.textContent = `Last sync: ${this.lastSyncTime.toLocaleString()}`;
      }
    }
  }
}
// Export the class for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = OneDriveSync;
} else {
  // For browser environments
  window.OneDriveSync = OneDriveSync;
}
