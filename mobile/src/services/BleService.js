class SimpleEventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  removeListener(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

const MOCK_DEVICE = {
  id: 'WM-RPR-001',
  name: 'SmartWaste Scale',
  mac: 'AA:BB:CC:DD:EE:FF',
  battery: 85,
};

class BleService extends SimpleEventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.mockInterval = null;
    this.currentDevice = null;
  }

  // Simulate scanning for BLE devices
  async scanForScales(timeoutMs = 5000) {
    return new Promise((resolve) => {
      console.log('[BLE MOCK] Scanning for SmartWaste scales...');
      setTimeout(() => {
        resolve([MOCK_DEVICE]);
      }, 1500); // Simulate scan delay
    });
  }

  // Simulate connecting to scale
  async connectToScale(deviceId) {
    return new Promise((resolve, reject) => {
      console.log(`[BLE MOCK] Connecting to ${deviceId}...`);
      setTimeout(() => {
        if (deviceId === MOCK_DEVICE.id || true) {
          this.isConnected = true;
          this.currentDevice = MOCK_DEVICE;
          this.emit('connected', MOCK_DEVICE);
          resolve(MOCK_DEVICE);
        } else {
          reject(new Error('Device not found'));
        }
      }, 2000);
    });
  }

  // Simulate weight reading from ESP32
  // PRD: ESP32 sends stable reading after 3 sec variance < 5g
  startWeightStream() {
    if (!this.isConnected) {
      throw new Error('Not connected to scale');
    }

    let stableCount = 0;
    let baseWeight = Math.floor(Math.random() * 2000) + 200; // 200-2200 grams

    this.mockInterval = setInterval(() => {
      // Simulate sensor noise ±5 grams
      const noise = (Math.random() - 0.5) * 10;
      const currentWeight = Math.round(baseWeight + noise);

      // PRD stability: variance < 5g for 3 seconds
      if (Math.abs(noise) < 5) {
        stableCount++;
      } else {
        stableCount = 0;
      }

      const isStable = stableCount >= 3; // 3 readings stable

      const payload = {
        device_id: MOCK_DEVICE.id,
        weight_grams: currentWeight,
        is_stable: isStable,
        battery: MOCK_DEVICE.battery,
        timestamp: new Date().toISOString(),
        is_mock: true, // Flag: remove when real hardware connected
      };

      this.emit('weightReading', payload);

      // Auto-lock when stable (PRD requirement)
      if (isStable) {
        this.emit('weightLocked', {
          ...payload,
          points_preview: Math.floor(currentWeight / 10),
        });
        this.stopWeightStream();
      }
    }, 1000);
  }

  stopWeightStream() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  async disconnect() {
    this.stopWeightStream();
    this.isConnected = false;
    this.currentDevice = null;
    this.emit('disconnected');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      device: this.currentDevice,
      isMock: true,
    };
  }
}

export const bleService = new BleService();
export default bleService;
