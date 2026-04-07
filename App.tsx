import React, { useState } from 'react';
import { Linking, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { SectionTabs } from './components/SectionTabs';
import { useBLE } from './hooks/useBLE';
import { usePermissions } from './hooks/usePermissions';
import { useSyncQueue } from './hooks/useSyncQueue';
import { PairedDevicesScreen } from './screens/PairedDevicesScreen';
import { ScanScreen } from './screens/ScanScreen';
import { useDeviceStore } from './store/deviceStore';
import { useSyncStore } from './store/syncStore';

function AppShell() {
  useSyncQueue();

  const [tab, setTab] = useState<'scan' | 'paired'>('scan');
  const {promptToOpenSettings} = usePermissions();
  const {
    scannedDevices,
    isScanning,
    connectingDeviceId,
    lastBleError,
    permissionState,
    beginScan,
    endScan,
    pairDevice,
    unpairDevice,
  } = useBLE();

  const pairedDevicesMap = useDeviceStore(state => state.pairedDevices);
  const queue = useSyncStore(state => state.queue);
  const isOnline = useSyncStore(state => state.isOnline);
  const lastSyncEvent = useSyncStore(state => state.lastSyncEvent);

  const scanDevices = Object.values(scannedDevices).sort(
    (left, right) => (right.rssi ?? -999) - (left.rssi ?? -999),
  );
  const pairedDevices = Object.values(pairedDevicesMap).sort(
    (left, right) => right.pairedAt - left.pairedAt,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Bajaj Assignment</Text>
          <Text style={styles.headerTitle}>BLE Device Manager</Text>
          <Text style={styles.headerSubtitle}>
            Onboard IoT peripherals, keep local pairing state reliable, and replay cloud
            sync safely when connectivity comes back.
          </Text>
        </View>

        <SectionTabs value={tab} onChange={setTab} />

        <View style={styles.screenArea}>
          {tab === 'scan' ? (
            <ScanScreen
              devices={scanDevices}
              isScanning={isScanning}
              connectingDeviceId={connectingDeviceId}
              lastBleError={lastBleError}
              permissionBlocked={permissionState === 'blocked'}
              onStartScan={() => {
                beginScan().catch(() => undefined);
              }}
              onStopScan={endScan}
              onPair={device => {
                pairDevice(device).catch(() => undefined);
              }}
              onOpenSettings={() => {
                promptToOpenSettings('bluetooth');
              }}
            />
          ) : (
            <PairedDevicesScreen
              devices={pairedDevices}
              isOnline={isOnline}
              queuedActions={queue.length}
              lastSyncEvent={lastSyncEvent}
              onUnpair={deviceId => {
                unpairDevice(deviceId).catch(() => undefined);
              }}
            />
          )}
        </View>

        <Text
          style={styles.footerText}
          onPress={() => {
            Linking.openSettings().catch(() => undefined);
          }}>
          {'Need to change Bluetooth or location permissions?\nOpen Settings.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edf5f9',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#0f6cbd',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    color: '#13324b',
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#526579',
    maxWidth: 580,
  },
  screenArea: {
    flex: 1,
  },
  footerText: {
    color: '#526579',
    textAlign: 'center',
    marginBottom: 6,
  },
});

export default App;
