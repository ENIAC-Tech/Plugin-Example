const { plugin, logger, pluginPath, resourcesPath } = require("@eniac/flexdesigner")
const path = require('path')
const { createCanvas } = require('@napi-rs/canvas');

const keyData = {}
var feedbackKeys = []

async function testAPIs()
{
    logger.info('Test plugin API calls')
    logger.info('showSnackbarMessage', await plugin.showSnackbarMessage('info', 'Hello from plugin!'))
    logger.info('getAppInfo', await plugin.getAppInfo())
    logger.info('setConfig', await plugin.setConfig({ test: 'Hello' }))
    logger.info('getConfig', await plugin.getConfig())
    logger.info('saveFile', await plugin.saveFile(path.resolve(pluginPath, 'test.txt'), 'Hello world!!!'))
    logger.info('openFile', await plugin.openFile(path.resolve(pluginPath, 'test.txt')))
    logger.info('getOpenedWindows', await plugin.getOpenedWindows())
    logger.info('getDeviceStatus', await plugin.getDeviceStatus())
    logger.info('dialog.showOpenDialog', await plugin.electronAPI('dialog.showOpenDialog', { properties: ["openDirectory"] }))
    logger.info('dialog.showSaveDialog', await plugin.electronAPI('dialog.showSaveDialog', { properties: ["openFile"] }))
    logger.info('dialog.showMessageBox', await plugin.electronAPI('dialog.showMessageBox', { type: "info", message: "Hello from plugin!" }))
    logger.info('dialog.showErrorBox', await plugin.electronAPI('dialog.showErrorBox', "Error", "This is an error message"))
    logger.info('app.getAppPath', await plugin.electronAPI('app.getAppPath'))
    logger.info('app.getPath', await plugin.electronAPI('app.getPath', "temp"))
    logger.info('screen.getCursorScreenPoint', await plugin.electronAPI('screen.getCursorScreenPoint'))
    logger.info('screen.getPrimaryDisplay', await plugin.electronAPI('screen.getPrimaryDisplay'))
    logger.info('screen.getAllDisplays', await plugin.electronAPI('screen.getAllDisplays'))
}

logger.info(`Plugin path: ${pluginPath}`)
logger.info(`Plugin Resources path: ${resourcesPath}`)

/**
 * Called when current active window changes
 * {
  "status": "changed",
  "oldWin": {
    "platform": "windows",
    "id": 13568630,
    "title": "Flexbar Designer - New Project*",
    "owner": {
      "processId": 16664,
      "path": Path to executable,
      "name": "Electron"
    },
    "bounds": {
      "x": 748,
      "y": 170,
      "width": 2171,
      "height": 1291
    },
    "memoryUsage": 229281792
  },
  "newWin": {
    "platform": "windows",
    "id": 2820094,
    "title": "apitest.vue - FlexDesigner-SDK - Visual Studio Code",
    "owner": {
      "processId": 7892,
      "path": Path to executable,
      "name": "Visual Studio Code"
    },
    "bounds": {
      "x": 0,
      "y": 0,
      "width": 1280,
      "height": 1528
    },
    "memoryUsage": 151236608
  }
}
 */
plugin.on('system.actwin', (payload) => {
    logger.info('Active window changed:', payload)
})

/**
 * Called when a shortcut is pressed
 * @param {object} payload shortcut data
 * {
 *  shortcut: 'CommandOrControl+F1'
 * }
 * @note Register shortcut in manifest.json, find available shortcuts: https://www.electronjs.org/docs/latest/api/accelerator
 */
plugin.on('system.shortcut', (payload) => {
    logger.info('Shortcut pressed:', payload)
})

/**
 * Called when plugin config is updated
 * @param {object} payload plugin config
 * {
 *  config: {}
 * }
 */
plugin.on('plugin.config.updated', (payload) => {
    logger.info('Plugin config updated:', payload)
})


/**
 * Called when received message from UI send by this.$fd.sendToBackend
 * @param {object} payload message sent from UI
 */
plugin.on('ui.message', async (payload) => {
    logger.info('Received message from UI:', payload)
    if (payload.data === 'test') {
        await testAPIs()
        return 'Done!'
    }
    else {
        return 'Hello from plugin backend!'
    }
})

/**
 * Called when device status changes
 * @param {object} devices device status data
 * [
 *  {
 *    serialNumber: '',
 *    deviceData: {
 *       platform: '',
 *       profileVersion: '',
 *       firmwareVersion: '',
 *       deviceName: '',
 *       displayName: ''
 *    }
 *  }
 * ]
 */
plugin.on('device.status', (devices) => {
    logger.info('Device status changed:', devices)
    for (let device of devices) {
        logger.info('Device status:', device)
        if (device.status === 'connected') {
            logger.info('setDeviceConfig')
            plugin.setDeviceConfig(device.serialNumber, {
                sleepTime: 1000,
                brightness: 100,
                screenFlip: true,
                vibrate: 'full',
                autoSleep: true,
                deviceName: 'Flexbar Plugin Test',
                cdcMode: true,
                color: 'space black'
            })
        }
    }
})

/**
 * Called when a plugin key is loaded
 * @param {Object} payload alive key data
 * {
 *  serialNumber: '',
 *  keys: [
 *  {
 *      "data": {},
 *      "cid": "com.eniac.example.wheel",
 *      "bg": 0,
 *      "width": 360,
 *      "pluginID": "com.eniac.example",
 *      "typeOverride": "plugin",
 *      "wheel": {
 *      "step": 5
 *      },
 *      "cfg": {
 *      "keyType": "wheel",
 *      "sendKey": true
 *      },
 *      "uid": 0,
 *      "sz": 2309
 *  }
 *  ]
 * }
 */
plugin.on('plugin.alive', (payload) => {
    logger.info('Plugin alive:', payload)
    const data = payload.keys
    const serialNumber = payload.serialNumber
    feedbackKeys = []
    for (let key of data) {
        keyData[key.uid] = key
        if (key.cid === 'com.eniac.example.counter') {
            keyData[key.uid].counter = parseInt(key.data.rangeMin)
            key.style.showIcon = false
            key.style.showTitle = true
            key.title = 'Click Me!'
            plugin.draw(serialNumber, key, 'draw')
        }
        else if (key.cid === 'com.eniac.example.slider') {
            plugin.set(serialNumber, key, {
                value: 50
            })
        }
        else if (key.cid === 'com.eniac.example.cyclebutton') {
            logger.debug('Setting state to 3')
            plugin.set(serialNumber, key, {
                state: 3
            })
        }
        else if (key.cid === 'com.eniac.example.apitest') {
            feedbackKeys.push(key)
        }
        else if (key.cid === 'com.eniac.example.dynamickey') {
            dynamicKeyTest(serialNumber, key)
        }
    }
})


/**
 * Called when user interacts with a key
 * @param {object} payload key data 
 * {
 *  serialNumber, 
 *  data
 * }
 */
plugin.on('plugin.data', (payload) => {
    logger.info('Received plugin.data:', payload)
    const data = payload.data
    const serialNumber = payload.serialNumber
    if (data.key.cid === "com.eniac.example.cyclebutton") {
        return {
            "status": "success",
            "message": `Last state: ${data.state}`
        }
    }
    else if (data.key.cid === "com.eniac.example.counter") {
        const key = data.key
        key.style.showIcon = false
        key.style.showTitle = true
        keyData[key.uid].counter++
        if (keyData[key.uid].counter > parseInt(key.data.rangeMax)) {
            keyData[key.uid].counter = parseInt(key.data.rangeMin)
        }
        key.title = `${keyData[key.uid].counter}`
        plugin.draw(serialNumber, key, 'draw')
    } 
    else if (data.key.cid === "com.eniac.example.snackbarmsg") {
        setImmediate(async () => {
            plugin.showFlexbarSnackbarMessage(serialNumber, 'This is a info message', 'info', 'bell')
            await new Promise(resolve => setTimeout(resolve, 1000))
            plugin.showFlexbarSnackbarMessage(serialNumber, 'This is a warning message', 'warning', 'warning')
            await new Promise(resolve => setTimeout(resolve, 1000))
            plugin.showFlexbarSnackbarMessage(serialNumber, 'This is a error message', 'error', 'close')
            await new Promise(resolve => setTimeout(resolve, 1000))
            plugin.showFlexbarSnackbarMessage(serialNumber, 'This is a success message', 'success', 'ok', 3000)
        })
    }
    else if (data.key.cid === 'com.eniac.example.wheel') {
      for (let key of feedbackKeys) {
          const bg = generateRainbowCanvas(key.width, `${data.state} ${data.delta || "0"}`)
          plugin.draw(serialNumber, key, 'base64', bg)
        }
    }
})

// Connect to flexdesigner and start the plugin
plugin.start()

setInterval(() => {
    const value = parseInt((Math.random() * 100000))
    plugin.sendChartData([
        {
            label: 'Custom Plugin Data', // Label to display in the FlexDesigner
            value: value / 1024, // Value after conversion
            unit: 'KB', // Unit after conversion
            baseUnit: 'B', // Unit before conversion
            baseVal: value, // Value before conversion
            maxLen: 2, // Maximum length of the value, 1-4
            category: 'custom', // Category of the value
            key: 'custom' // Key of the value, should be unique of multiple values
        }
    ])
}, 1000);

setTimeout(() => {
    // Register a shortcut
    plugin.updateShortcuts([
        {
            shortcut: 'CommandOrControl+F2',
            action: 'register'
        }
    ])
}, 1000);

/**
 * @brief Generates a PNG base64 string with a rainbow gradient and a centered number.
 *
 * Detailed description:
 * This function creates a canvas using @napi-rs/canvas with the specified width and a fixed height of 60 pixels.
 * It draws a rainbow gradient background across the canvas and then draws the number '0' in the center.
 * Finally, the canvas is converted into a PNG base64 string that includes the MIME type.
 *
 * @param {number} width - The width of the canvas.
 * @param {number} value - The number to be drawn in the center of the canvas.
 * @return {string} The PNG base64 string with MIME type.
 */
function generateRainbowCanvas(width, value) {
    const height = 60;
    // Create a canvas with the specified dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
  
    // Create a linear gradient from left to right for the rainbow effect
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0.0, 'red');
    gradient.addColorStop(0.16, 'orange');
    gradient.addColorStop(0.33, 'yellow');
    gradient.addColorStop(0.50, 'green');
    gradient.addColorStop(0.66, 'blue');
    gradient.addColorStop(0.83, 'indigo');
    gradient.addColorStop(1.0, 'violet');
  
    // Fill the canvas with the rainbow gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  
    // Set the font and text properties
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Draw text shadow
    ctx.fillStyle = 'black';
    ctx.fillText(value, width / 2 + 2, height / 2 + 2);
    // Draw text
    ctx.fillStyle = 'white';
    ctx.fillText(value, width / 2, height / 2);
  
    // Convert the canvas to a PNG base64 string with MIME type
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  }

/**
 * @brief Test dynamic key API
 * @param {string} serialNumber - The serial number of the device
 * @param {object} key - The key object
 */
function dynamicKeyTest(serialNumber, key) {
    setImmediate(async () => {
        // delete all keys
        plugin.dynamickey.clear(serialNumber, key)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // change width to 
        plugin.dynamickey.setWidth(serialNumber, key, 500)

        // add 5 keys
        for (let i = 0; i < 5; i++) {
            plugin.dynamickey.add(serialNumber, key, 0, 'base64', generateRainbowCanvas(200, `${i}`), 200, {name: `Key ${i}`})
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // delete index 2
        await new Promise(resolve => setTimeout(resolve, 1000))
        plugin.dynamickey.remove(serialNumber, key, 2)

        // // change width to 2000px
        // await new Promise(resolve => setTimeout(resolve, 1000))
        // plugin.dynamickey.setWidth(serialNumber, key, 2000)

        // move index 0 to index 2
        await new Promise(resolve => setTimeout(resolve, 1000))
        plugin.dynamickey.move(serialNumber, key, 0, 2)

        // redraw index 1
        await new Promise(resolve => setTimeout(resolve, 1000))
        plugin.dynamickey.draw(serialNumber, key, 1, 'base64', generateRainbowCanvas(200, `Hello`), 100)
        // refresh is recommended to call after width of key is changed
        await new Promise(resolve => setTimeout(resolve, 50))
        plugin.dynamickey.refresh(serialNumber, key)

        // update user data of index 0
        await new Promise(resolve => setTimeout(resolve, 1000))
        plugin.dynamickey.update(serialNumber, key, 0, {name: 'User data Updated'})

    })
}