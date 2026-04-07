import React, { useDeferredValue } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DeviceCard } from '../components/DeviceCard';
import { PermissionNotice } from '../components/PermissionNotice';
import { APP_COPY, TARGET_SERVICE_UUID_PREFIX } from '../utils/constants';
import { ScannedDevice } from '../types/device';

export function ScanScreen({
  devices,
  isScanning,
  connectingDeviceId,
  lastBleError,
  permissionBlocked,
  onStartScan,
  onStopScan,
  onPair,
  onOpenSettings,
}: {
  devices: ScannedDevice[];
  isScanning: boolean;
  connectingDeviceId: string | null;
  lastBleError: string | null;
  permissionBlocked: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  onPair: (device: ScannedDevice) => void;
  onOpenSettings: () => void;
}) {
  const deferredDevices = useDeferredValue(devices);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>BLE Onboarding</Text>
        <Text style={styles.title}>Discover nearby field devices</Text>
        <Text style={styles.subtitle}>
          Filtering advertisements by service UUID prefix `{TARGET_SERVICE_UUID_PREFIX}` and
          ranking by strongest signal first.
        </Text>
        <View style={styles.controlsRow}>
          <Pressable
            style={[styles.primaryButton, isScanning && styles.secondaryButton]}
            onPress={isScanning ? onStopScan : onStartScan}>
            <Text
              style={[
                styles.primaryButtonText,
                isScanning && styles.secondaryButtonText,
              ]}>
              {isScanning ? 'Stop Scan' : 'Start Scan'}
            </Text>
          </Pressable>
          <View style={styles.scanPill}>
            <Text style={styles.scanPillText}>
              {isScanning ? 'Scanning live' : 'Idle'}
            </Text>
          </View>
        </View>
      </View>

      {permissionBlocked ? (
        <PermissionNotice
          title={APP_COPY.bluetoothPermissionTitle}
          message={APP_COPY.bluetoothPermissionMessage}
          onPress={onOpenSettings}
        />
      ) : null}

      {lastBleError ? <Text style={styles.errorText}>{lastBleError}</Text> : null}

      <FlatList
        data={deferredDevices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <DeviceCard
            variant="scan"
            device={item}
            loading={connectingDeviceId === item.id}
            onPress={() => onPair(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matching BLE devices yet</Text>
            <Text style={styles.emptyText}>
              Start a scan and make sure the IoT device is powered on and advertising the
              expected service UUID prefix.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  hero: {
    backgroundColor: '#0d2a3c',
    borderRadius: 28,
    padding: 20,
    gap: 12,
  },
  eyebrow: {
    color: '#8ac7ff',
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#d8e8f5',
    lineHeight: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#8ae6b6',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#0d2a3c',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#0d2a3c',
  },
  scanPill: {
    backgroundColor: '#20445d',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scanPillText: {
    color: '#d8e8f5',
    fontWeight: '700',
  },
  errorText: {
    color: '#b42318',
    backgroundColor: '#fde5e3',
    borderRadius: 16,
    padding: 12,
    lineHeight: 18,
  },
  listContent: {
    gap: 12,
    paddingBottom: 40,
  },
  emptyState: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d8e2ec',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#13324b',
  },
  emptyText: {
    color: '#61758a',
    textAlign: 'center',
    lineHeight: 20,
  },
});
