import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PairedDevice, ScannedDevice } from '../types/device';
import { SignalStrength } from './SignalStrength';
import { SyncStatusBadge } from './SyncStatusBadge';

type DeviceCardProps =
  | {
      variant: 'scan';
      device: ScannedDevice;
      loading?: boolean;
      actionLabel?: string;
      onPress: () => void;
    }
  | {
      variant: 'paired';
      device: PairedDevice;
      loading?: boolean;
      onPress: () => void;
    };

export function DeviceCard(props: DeviceCardProps) {
  const {device, loading = false, onPress, variant} = props;
  const isPaired = variant === 'paired';
  const actionLabel = variant === 'scan' ? props.actionLabel ?? 'Tap to pair' : null;
  const identifier = device.serviceUUIDs?.length ? device.serviceUUIDs : device.id;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.grow}>
          <Text style={styles.name}>{device.name}</Text>
          <Text style={styles.identifier}>{identifier}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#0f6cbd" />
        ) : (
          <SignalStrength rssi={device.rssi} />
        )}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.meta}>
          RSSI {device.rssi ?? 'n/a'}
          {isPaired
            ? ` · ${device.isConnected ? 'Connected' : 'Disconnected'}`
            : ''}
        </Text>
        {isPaired ? (
          <SyncStatusBadge status={device.syncStatus} />
        ) : (
          <Text style={styles.actionText}>{actionLabel}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#d8e2ec',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#13324b',
  },
  identifier: {
    marginTop: 4,
    fontSize: 12,
    color: '#61758a',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  meta: {
    fontSize: 12,
    color: '#526579',
  },
  actionText: {
    color: '#0f6cbd',
    fontSize: 13,
    fontWeight: '700',
  },
});
