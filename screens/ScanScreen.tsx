import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DeviceCard } from '../components/DeviceCard';
import { PermissionNotice } from '../components/PermissionNotice';
import { APP_COPY } from '../utils/constants';
import { ScannedDevice } from '../types/device';

export function ScanScreen({
  devices,
  pairedDeviceIds,
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
  pairedDeviceIds: string[];
  isScanning: boolean;
  connectingDeviceId: string | null;
  lastBleError: string | null;
  permissionBlocked: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  onPair: (device: ScannedDevice) => void;
  onOpenSettings: () => void;
}) {
  const [uuidFilter, setUuidFilter] = useState('');
  const [rssiSort, setRssiSort] = useState<'none' | 'asc' | 'desc'>('none');
  const deferredDevices = useDeferredValue(devices);
  const filteredDevices = useMemo(() => {
    const normalizedFilter = uuidFilter.trim().toLowerCase();
    const baseDevices = !normalizedFilter
      ? deferredDevices
      : deferredDevices.filter(device =>
          device.serviceUUIDs?.some(uuid =>
            uuid.toLowerCase().startsWith(normalizedFilter),
          ),
        );

    if (rssiSort === 'none') {
      return baseDevices;
    }

    return [...baseDevices].sort((left, right) => {
      if (left.rssi == null && right.rssi == null) {
        return 0;
      }

      if (left.rssi == null) {
        return 1;
      }

      if (right.rssi == null) {
        return -1;
      }

      return rssiSort === 'desc'
        ? right.rssi - left.rssi
        : left.rssi - right.rssi;
    });
  }, [deferredDevices, rssiSort, uuidFilter]);

  const sortLabel =
    rssiSort === 'desc' ? 'RSSI ↓' : rssiSort === 'asc' ? 'RSSI ↑' : 'RSSI';

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredDevices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>BLE Onboarding</Text>
              <Text style={styles.title}>Discover nearby field devices</Text>
              <Text style={styles.subtitle}>
                Scanning all nearby BLE devices. Optionally filter by service UUID prefix.
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
                    Status: {isScanning ? 'Scanning live' : 'Idle'}
                  </Text>
                </View>
              </View>
              <Text style={styles.helperText}>
                Devices stay in discovery order while signal strength updates live.
              </Text>
            </View>

            {permissionBlocked ? (
              <PermissionNotice
                title={APP_COPY.bluetoothPermissionTitle}
                message={APP_COPY.bluetoothPermissionMessage}
                onPress={onOpenSettings}
              />
            ) : null}

            {lastBleError ? <Text style={styles.errorText}>{lastBleError}</Text> : null}

            {deferredDevices.length > 0 ? (
              <View style={styles.filterRow}>
                <TextInput
                  value={uuidFilter}
                  onChangeText={setUuidFilter}
                  placeholder="Filter by UUID prefix"
                  placeholderTextColor="#7b8da1"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.filterInput}
                />
                <Pressable
                  style={[
                    styles.sortButton,
                    rssiSort !== 'none' && styles.sortButtonActive,
                  ]}
                  onPress={() => {
                    setRssiSort(current =>
                      current === 'none'
                        ? 'desc'
                        : current === 'desc'
                          ? 'asc'
                          : 'none',
                    );
                  }}>
                  <Text
                    style={[
                      styles.sortButtonText,
                      rssiSort !== 'none' && styles.sortButtonTextActive,
                    ]}>
                    {sortLabel}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <DeviceCard
            variant="scan"
            device={item}
            loading={connectingDeviceId === item.id}
            actionLabel={pairedDeviceIds.includes(item.id) ? 'Unpair device' : 'Tap to pair'}
            onPress={() => onPair(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isScanning ? 'No BLE devices found' : 'Start scanning to see devices'}
            </Text>
            <Text style={styles.emptyText}>
              {isScanning
                ? 'Make sure nearby Bluetooth peripherals are powered on and advertising.'
                : 'Tap Start Scan to discover nearby Bluetooth peripherals.'}
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
  },
  headerContent: {
    gap: 16,
    marginBottom: 16,
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
  helperText: {
    color: '#b8d3e8',
    lineHeight: 18,
    fontSize: 12,
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
  filterInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8e2ec',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#13324b',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8e2ec',
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#dceeff',
    borderColor: '#8bbcf0',
  },
  sortButtonText: {
    color: '#13324b',
    fontSize: 14,
    fontWeight: '700',
  },
  sortButtonTextActive: {
    color: '#0f6cbd',
  },
  listContent: {
    gap: 12,
    flexGrow: 1,
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
