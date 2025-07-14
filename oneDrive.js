// Microsoft Graph API integration for OneDrive synchronization
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
    this.lastModifiedTime = null;
    this.syncInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.pollingInterval = 30000; // Check every 30 seconds

    // Event handlers
    this.onFileChanged = null;
    this.onSyncError = null;
    this.onSyncSuccess = null;
    this.checkAuthState();
    // Check if we have stored credentials
    this.loadStoredAuth();
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
      console.error("[Auth] Failed to check auth state:", error);
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
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: true,
        },
        system: {
          allowNativeBroker: false, // Disable native broker
          loggerOptions: {
            logLevel: msal.LogLevel.Verbose,
            piiLoggingEnabled: false,
          },
        },
      };

      this.msalInstance = new msal.PublicClientApplication(msalConfig);
    }
    return this.msalInstance;
  }

  // Initialize OneDrive sync
  async init(options = {}) {
    console.log("[OneDrive] Initializing OneDrive sync...");

    // Apply custom options
    if (options.fileName) this.config.fileName = options.fileName;
    if (options.filePath) this.config.filePath = options.filePath;
    if (options.pollingInterval) this.pollingInterval = options.pollingInterval;
    if (options.onFileChanged) this.onFileChanged = options.onFileChanged;
    if (options.onSyncError) this.onSyncError = options.onSyncError;
    if (options.onSyncSuccess) this.onSyncSuccess = options.onSyncSuccess;

    try {
      // Sign in and get file ID if not available
      if (!this.authToken) {
        await this.signIn();
      }

      if (!this.config.fileId) {
        await this.findFileId();
      }

      // Start polling for changes
      this.startSyncPolling();

      return true;
    } catch (error) {
      console.error("[OneDrive] Initialization failed:", error);
      if (this.onSyncError) {
        this.onSyncError("Failed to initialize OneDrive sync", error);
      }
      return false;
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
  async checkForChanges() {
    if (!this.config.fileId || !this.authToken) {
      throw new Error("File ID or auth token not available");
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${this.config.fileId}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          console.log("[OneDrive] Token expired, refreshing...");
          await this.refreshToken();
          return this.checkForChanges();
        }
        throw new Error(`Failed to check file: ${response.statusText}`);
      }

      const data = await response.json();
      const newModifiedTime = data.lastModifiedDateTime;

      // If the file has been modified since our last check
      if (
        !this.lastModifiedTime ||
        new Date(newModifiedTime) > new Date(this.lastModifiedTime)
      ) {
        console.log(
          `[OneDrive] File changed! Last: ${this.lastModifiedTime}, New: ${newModifiedTime}`
        );
        this.lastModifiedTime = newModifiedTime;
        localStorage.setItem("oneDriveLastModified", this.lastModifiedTime);

        // Download and process the updated file
        await this.downloadAndProcessFile();
      }

      // Reset retry count on successful check
      this.retryCount = 0;

      if (this.onSyncSuccess) {
        this.onSyncSuccess("Sync check completed successfully");
      }
    } catch (error) {
      console.error("[OneDrive] Error checking for changes:", error);
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
