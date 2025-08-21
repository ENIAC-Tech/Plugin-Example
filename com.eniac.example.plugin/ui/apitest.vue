<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>{{ $t('APITest.UI.Title') }}</h1>
        <p>{{ $t('APITest.UI.Description') }}</p>
      </v-col>
    </v-row>

    <!-- Result window for showing test results -->
    <v-row dense>
      <v-col cols="12">
        <v-card>
          <v-card-title>{{ $t('APITest.UI.TestResults') }}</v-card-title>
          <v-card-text>
            <v-textarea v-model="testResults" readonly hide-details variant="solo"></v-textarea>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dynamic list of test items -->
    <v-row dense style="height: 50vh; overflow-y: auto;">
      <v-col v-for="(callback, index) in callbacks" :key="index" cols="12" sm="6" md="4">
        <v-card class="ma-2" min-height="150px">
          <v-card-title>{{ callback.title }}</v-card-title>
          <v-card-text class="pb-0">
            <p>{{ $tm('APITest.UI.TestItemDescriptions')[callback.title] }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="orange" @click="executeTest(callback)" :loading="testing">Test
              <template v-slot:loader>
              <v-progress-circular color="orange" size="30"
                indeterminate></v-progress-circular>
            </template>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      /**
       * @property {string} testResults - Stores all the results of the tests.
       */
       testResults: "",

      /**
       * @property {boolean} testing - Flag to indicate if the tests are currently running.
       */
       testing: false,
       
      /**
       * @property {Array} callbacks - List of test callbacks with title and corresponding test function.
       * This allows easy addition of more tests in the future.
       */
       callbacks: [
        {
          title: "sendToBackend",
          callback: this.testSendToBackend,
        },
        {
          title: "Backend API Test",
          callback: this.testBackendAPIs,
        },
        {
          title: "Logger Test",
          callback: this.testLoggerCalls,
        },
        {
          title: "getConfig",
          callback: this.testGetConfig,
        },
        {
          title: "setConfig",
          callback: this.testSetConfig,
        },
        {
          title: "triggerClickVibration",
          callback: this.testTriggerClickVibration,
        },
        {
          title: "getAppInfo",
          callback: this.testGetAppInfo,
        },
        {
          title: "saveFile",
          callback: this.testSaveFile,
        },
        {
          title: "openFile",
          callback: this.testOpenFile,
        },
        {
          title: "getOpenedWindows",
          callback: this.testGetOpenedWindows,
        },
        {
          title: "getDeviceStatus",
          callback: this.testGetDeviceStatus,
        },
        {
          title: "pickColor",
          callback: this.testPickColor,
        },
        {
          title: "takeScreenshot",
          callback: this.testTakeScreenshot,
        },
        {
          title: "showSnackbarMessage",
          callback: this.testShowSnackbarMessage,
        },
        {
          title: "dialog.showOpenDialog",
          callback: this.testShowOpenDialog,
        },
        {
          title: "dialog.showSaveDialog",
          callback: this.testShowSaveDialog,
        },
        {
          title: "dialog.showMessageBox",
          callback: this.testShowMessageBox,
        },
        {
          title: "dialog.showErrorBox",
          callback: this.testShowErrorBox,
        },
        {
          title: "app.getAppPath",
          callback: this.testGetAppPath,
        },
        {
          title: "app.getPath",
          callback: this.testGetPath,
        },
        {
          title: "screen.getCursorScreenPoint",
          callback: this.testGetCursorScreenPoint,
        },
        {
          title: "screen.getPrimaryDisplay",
          callback: this.testGetPrimaryDisplay,
        },
        {
          title: "screen.getAllDisplays",
          callback: this.testGetAllDisplays,
        },
      ],
    };
  },
  methods: {

    /**
     * @function executeTest
     * @description Executes the test associated with the clicked button and updates the results.
     * @param {Object} callback - The callback object containing the test information.
     */
    async executeTest(callback) {
      this.testing = true;
      const result = await callback.callback();
      this.testing = false;
      this.testResults = `${callback.title}: ${result}`;
    },

    /**
     * @function testSendToBackend
     * @description Sends a test message to the backend and returns the result.
     */
    async testSendToBackend() {
      try {
        const result = await this.$fd.sendToBackend({ data: "Hello from UI!" });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    async testTriggerClickVibration() {
      try {
        const result = await this.$fd.sendToBackend({ data: "TriggerClickVibration" });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testBackendAPIs
     * @description Calls various backend APIs.
     */
    async testBackendAPIs() {
      try {
        const result = await this.$fd.sendToBackend({ data: "test" }, 0);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testLoggerCalls
     * @description Calls various logger methods and returns the result.
     */
    async testLoggerCalls() {
      try {
        this.$fd.debug("Logger debug message");
        this.$fd.info("Logger info message");
        this.$fd.warn("Logger warn message");
        this.$fd.error("Logger error message");
        return "Logger methods have been called successfully.";
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetConfig
     * @description Retrieves the current configuration and returns the result.
     */
    async testGetConfig() {
      try {
        const config = await this.$fd.getConfig();
        return JSON.stringify(config, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testSetConfig
     * @description Sets a test configuration and returns the result status.
     */
    async testSetConfig() {
      try {
        await this.$fd.setConfig({ test: "test" });
        return "Configuration set successfully.";
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetAppInfo
     * @description Retrieves application information from $fd and returns the result.
     */
    async testGetAppInfo() {
      try {
        const info = await this.$fd.getAppInfo();
        return JSON.stringify(info, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testSaveFile
     * @description Saves a file and returns the result status.
     */
    async testSaveFile() {
      try {
        const appDataPath = await this.$fd.electronAPI("app.getPath", "appData");
        await this.$fd.saveFile(appDataPath + "/test.txt", "Hello World! " + new Date());
        return "File saved successfully.";
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testOpenFile
     * @description Opens a previously saved file and returns its content.
     */
    async testOpenFile() {
      try {
        const appDataPath = await this.$fd.electronAPI("app.getPath", "appData");
        const content = await this.$fd.openFile(appDataPath + "/test.txt");
        return content;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    // Other individual test functions like testGetOpenedWindows, testGetDeviceStatus, etc.
    // Follow the same structure as above to handle the different functionalities.

    /**
     * @function testGetOpenedWindows
     * @description Retrieves the list of opened windows and returns the result.
     */
    async testGetOpenedWindows() {
      try {
        const result = await this.$fd.getOpenedWindows();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetDeviceStatus
     * @description Retrieves the current device status and returns it.
     */
    async testGetDeviceStatus() {
      try {
        const status = await this.$fd.getDeviceStatus();
        return JSON.stringify(status, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testPickColor
     * @description Opens the color picker and returns the selected color.
     */
    async testPickColor() {
      try {
        const color = await this.$fd.pickColor();
        return color;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testTakeScreenshot
     * @description Captures the screen and shows the returned metadata (base64 and bounds).
     */
     async testTakeScreenshot() {
      try {
        const screenshotData = await this.$fd.takeScreenshot();
        return JSON.stringify(screenshotData, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testShowSnackbarMessage
     * @description Shows a snackbar message via $fd and displays the result status.
     */
    async testShowSnackbarMessage() {
      try {
        await this.$fd.showSnackbarMessage("info", "Hello from UI");
        return "Snackbar displayed successfully.";
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testShowOpenDialog
     * @description Invokes the Electron open dialog and stores the result.
     */
    async testShowOpenDialog() {
      try {
        const options = { properties: ["openDirectory"] };
        const result = await this.$fd.electronAPI("dialog.showOpenDialog", options);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testShowSaveDialog
     * @description Invokes the Electron save dialog and stores the result.
     */
    async testShowSaveDialog() {
      try {
        const appDataPath = await this.$fd.electronAPI("app.getPath", "appData");
        const options = { defaultPath: appDataPath + "/test.txt" };
        const result = await this.$fd.electronAPI("dialog.showSaveDialog", options);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testShowMessageBox
     * @description Invokes the Electron message box and stores the result.
     */
    async testShowMessageBox() {
      try {
        const options = {
          type: "info",
          title: "Hello",
          message: "Hello from UI",
        };
        const result = await this.$fd.electronAPI("dialog.showMessageBox", options);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testShowErrorBox
     * @description Invokes the Electron error box and stores the result.
     */
    async testShowErrorBox() {
      try {
        const result = await this.$fd.electronAPI(
          "dialog.showErrorBox",
          "Hello",
          "Hello from UI"
        );
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetAppPath
     * @description Retrieves the application installation path.
     */
    async testGetAppPath() {
      try {
        const result = await this.$fd.electronAPI("app.getAppPath");
        return result;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetPath
     * @description Retrieves a specific path (e.g., appData) from Electron.
     */
    async testGetPath() {
      try {
        const result = await this.$fd.electronAPI("app.getPath", "appData");
        return result;
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetCursorScreenPoint
     * @description Retrieves the current cursor position on screen.
     */
    async testGetCursorScreenPoint() {
      try {
        const point = await this.$fd.electronAPI("screen.getCursorScreenPoint");
        return JSON.stringify(point, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },

    /**
     * @function testGetPrimaryDisplay
     * @description Retrieves metadata about the primary display.
     */
    async testGetPrimaryDisplay() {
      try {
        const displayInfo = await this.$fd.electronAPI("screen.getPrimaryDisplay");
        return JSON.stringify(displayInfo, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },
 
    /**
     * @function testGetAllDisplays
     * @description Retrieves metadata about all available displays.
     */
    async testGetAllDisplays() {
      try {
        const displays = await this.$fd.electronAPI("screen.getAllDisplays");
        return JSON.stringify(displays, null, 2);
      } catch (error) {
        return `Error: ${error.message}`;
      }
    },
  },
  mounted() {
    // Listen to messages from backend on component mount
    this.$fd.onBackendMessage((data) => {
      console.log("Received message from backend:", data);
    });

    // Initial info message
    this.$fd.info("Hello from UI");
  }
};
</script>

<style scoped>

</style>
