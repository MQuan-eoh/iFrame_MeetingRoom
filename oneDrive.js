// Microsoft Graph API integration for OneDrive synchronization
class OneDriveSync {
  constructor() {
    // Microsoft Graph API configuration
    this.config = {
      clientId: "4a87bff7-097b-4771-91fe-21a5ab64a6d8",
      redirectUri: "https://mquan-eoh.github.io/iFrame_MeetingRoom/",
      scopes: ["Files.Read", "Files.Read.All", "User.Read", "Sites.Read.All"],
      fileId: null,
      fileName: "MeetingSchedule.xlsx",
      filePath: "/Documents/",
      autoConnect: false, // Thêm flag mới
    };

    this.isAuthenticated = false;
    this.authToken = null;
    this.refreshToken = null;
    this.tokenExpiryTime = null;
    this.lastModifiedTime = null;
    this.syncInterval = null;
    this.healthCheckInterval = null;
    this.retryCount = 0;
    this.maxRetries = 10; //Increase max retries
    this.pollingInterval = 120000; //Changed to 2 minutes
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20; //Increase max reconnect attempts
    this.tokenRefreshBuffer = 300000; // 5 minutes buffer before token expiry
    this.connectionHealthy = false;
    this.isInitializing = false;
    this.lastSyncTime = null;

    // Event handlers
    this.onFileChanged = null;
    this.onSyncError = null;
    this.onSyncSuccess = null;
    this.onConnectionStatusChanged = null;

    this.loadStoredAuth();

    setTimeout(() => {
      this.startHealthCheck();
    }, 5000);
  }

  //Update init method to handle options and auto-connect
  async init(options = {}) {
    console.log("[OneDrive] Initializing OneDrive sync...");

    if (this.isInitializing) {
      console.log("[OneDrive] Already initializing, skipping duplicate call");
      return;
    }

    this.isInitializing = true;

    try {
      // Apply custom options
      if (options.fileName) this.config.fileName = options.fileName;
      if (options.filePath) this.config.filePath = options.filePath;
      if (options.pollingInterval)
        this.pollingInterval = options.pollingInterval;
      if (options.autoConnect !== undefined)
        this.config.autoConnect = options.autoConnect;

      // Set event handlers
      this.onFileChanged = options.onFileChanged || this.onFileChanged;
      this.onSyncError = options.onSyncError || this.onSyncError;
      this.onSyncSuccess = options.onSyncSuccess || this.onSyncSuccess;
      this.onConnectionStatusChanged =
        options.onConnectionStatusChanged || this.onConnectionStatusChanged;

      // Notify that we're trying to connect
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(false, "Initial connection");
      }

      // Try to restore session
      const accounts = this.getMsalInstance().getAllAccounts();
      if (accounts.length > 0) {
        console.log("[OneDrive] Restoring previous session");
        await this.acquireToken();
      } else if (this.config.autoConnect) {
        console.log("[OneDrive] Auto-connecting...");
        try {
          await this.signIn();
        } catch (error) {
          console.warn("[OneDrive] Auto sign-in failed:", error);
          // Silent failure in auto-connect mode
          this.isInitializing = false;

          // Retry after delay
          setTimeout(() => {
            this.init(options);
          }, 30000);

          return false;
        }
      } else {
        console.log("[OneDrive] No previous session and auto-connect disabled");
        this.isInitializing = false;
        return false;
      }

      // Get file ID if not already available
      if (!this.config.fileId) {
        try {
          await this.findFileId();
        } catch (error) {
          console.error("[OneDrive] Error finding file:", error);

          if (this.config.autoConnect) {
            // In auto-connect mode, retry after delay
            this.isInitializing = false;
            setTimeout(() => {
              this.init(options);
            }, 30000);
            return false;
          } else {
            // In manual mode, propagate error
            throw error;
          }
        }
      }

      // Start polling for changes
      this.startSyncPolling();

      // Start health check
      this.startHealthCheck();

      // Update connection status
      this.connectionHealthy = true;
      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(true, "Connected");
      }

      this.isInitializing = false;
      return true;
    } catch (error) {
      console.error("[OneDrive] Initialization failed:", error);

      if (this.onSyncError) {
        this.onSyncError("Failed to initialize OneDrive sync", error);
      }

      if (this.onConnectionStatusChanged) {
        this.onConnectionStatusChanged(false, "Connection failed");
      }

      this.isInitializing = false;

      // Auto-retry in auto-connect mode
      if (this.config.autoConnect) {
        setTimeout(() => {
          this.init(options);
        }, 60000);
      }

      return false;
    }
  }

  // Cải tiến health check để giữ kết nối liên tục
  startHealthCheck() {
    // Clear existing health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Kiểm tra sức khỏe kết nối thường xuyên hơn (30 giây)
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000);

    // Thực hiện kiểm tra ngay lập tức
    this.checkConnectionHealth();
  }

  async checkConnectionHealth() {
    console.log("[OneDrive] Performing connection health check...");

    // Nếu đang khởi tạo, bỏ qua health check
    if (this.isInitializing) {
      console.log(
        "[OneDrive] Initialization in progress, skipping health check"
      );
      return;
    }

    try {
      // Kiểm tra token và trạng thái đăng nhập
      if (!this.authToken || !this.isAuthenticated) {
        console.log("[OneDrive] No active session, attempting reconnect...");
        await this.reconnect();
        return;
      }

      // Kiểm tra token hết hạn
      if (
        this.tokenExpiryTime &&
        new Date(this.tokenExpiryTime) - new Date() < this.tokenRefreshBuffer
      ) {
        console.log("[OneDrive] Token expiring soon, refreshing...");
        await this.refreshToken();
      }

      // Xác minh kết nối bằng API call đơn giản
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
            this.onConnectionStatusChanged(true, "Connection restored");
          }

          // Nếu kết nối được khôi phục, kiểm tra xem có thay đổi file không
          if (this.config.fileId) {
            this.checkForChanges().catch((err) => {
              console.error(
                "[OneDrive] Error checking changes after reconnect:",
                err
              );
            });
          }
        }

        this.reconnectAttempts = 0;
      } else {
        console.warn(
          "[OneDrive] Connection health check failed with status:",
          response.status
        );

        if (response.status === 401) {
          // Token hết hạn
          await this.refreshToken();
        } else {
          // Lỗi khác
          throw new Error(
            `Health check failed with status: ${response.status}`
          );
        }
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

  // Download and process the file when changed
  async downloadAndProcessFile() {
    try {
      console.log(`[OneDrive] Downloading file with ID: ${this.config.fileId}`);

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${this.config.fileId}/content`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
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

      return file;
    } catch (error) {
      console.error("[OneDrive] Error downloading file:", error);
      if (this.onSyncError) {
        this.onSyncError("Failed to download updated file", error);
      }
      throw error;
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
}
// Export the class for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = OneDriveSync;
} else {
  // For browser environments
  window.OneDriveSync = OneDriveSync;
}
