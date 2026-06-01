import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { bleService } from '../../services/BleService';

export default function BleWeightScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState('Disconnected');
  const [device, setDevice] = useState(null);
  const [weight, setWeight] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [pointsPreview, setPointsPreview] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const onConnected = (dev) => {
      setStatus('Connected');
      setDevice(dev);
      bleService.startWeightStream();
    };

    const onDisconnected = () => {
      setStatus('Disconnected');
      setDevice(null);
      setWeight(0);
      setIsStable(false);
    };

    const onWeightReading = (data) => {
      setWeight(data.weight_grams);
      setIsStable(data.is_stable);
    };

    const onWeightLocked = (data) => {
      setWeight(data.weight_grams);
      setIsStable(true);
      setPointsPreview(data.points_preview);
    };

    bleService.on('connected', onConnected);
    bleService.on('disconnected', onDisconnected);
    bleService.on('weightReading', onWeightReading);
    bleService.on('weightLocked', onWeightLocked);

    return () => {
      bleService.disconnect();
      bleService.removeListener('connected', onConnected);
      bleService.removeListener('disconnected', onDisconnected);
      bleService.removeListener('weightReading', onWeightReading);
      bleService.removeListener('weightLocked', onWeightLocked);
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setStatus('Scanning...');
    try {
      const devices = await bleService.scanForScales();
      if (devices.length > 0) {
        setDevice(devices[0]);
        setStatus('Found Device');
      } else {
        setStatus('No Devices Found');
      }
    } catch (err) {
      setStatus('Scan Failed');
    }
    setIsScanning(false);
  };

  const handleConnect = async () => {
    if (!device) return;
    setIsConnecting(true);
    setStatus('Connecting...');
    try {
      await bleService.connectToScale(device.id);
    } catch (err) {
      setStatus('Connection Failed');
    }
    setIsConnecting(false);
  };

  const handleUseWeight = () => {
    navigation.navigate('CollectionScreen', {
      weight_grams: weight,
      ble_verified: true,
      device_id: device?.id || 'WM-RPR-001'
    });
  };

  return (
    <View style={styles.container}>
      {/* Mock Badge */}
      <View style={styles.mockBadge}>
        <Text style={styles.mockBadgeText}>⚠️ SIMULATOR MODE</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.header}>SmartWaste Scale</Text>
        <Text style={styles.status}>Status: {status}</Text>

        {!device && !isScanning && (
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <Text style={styles.buttonText}>Scan for Scale</Text>
          </TouchableOpacity>
        )}

        {isScanning && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        )}

        {device && status !== 'Connected' && !isConnecting && (
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceText}>
              {device.id} — {device.name} 🔋{device.battery}%
            </Text>
            <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}

        {isConnecting && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        )}

        {status === 'Connected' && (
          <View style={styles.readingContainer}>
            <Text style={[styles.weightText, isStable ? styles.textGreen : styles.textRed]}>
              {isStable ? '✓ LOCKED: ' : 'Stabilizing... '}
              {weight} grams
            </Text>
            
            {isStable && (
              <Text style={styles.pointsText}>= {pointsPreview} Points</Text>
            )}

            {isStable && (
              <TouchableOpacity style={styles.useWeightButton} onPress={handleUseWeight}>
                <Text style={styles.buttonText}>Use This Weight</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mockBadge: {
    backgroundColor: '#fbbf24',
    padding: 10,
    alignItems: 'center',
  },
  mockBadgeText: {
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  useWeightButton: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceInfo: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  deviceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  readingContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  weightText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 18,
    color: '#16a34a',
    marginTop: 10,
    fontWeight: 'bold',
  },
  textGreen: {
    color: '#16a34a',
  },
  textRed: {
    color: '#dc2626',
  },
  loader: {
    marginVertical: 20,
  },
});
