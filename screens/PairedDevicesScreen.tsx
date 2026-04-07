import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DeviceCard } from '../components/DeviceCard';
import { PairedDevice } from '../types/device';

export function PairedDevicesScreen({
  devices,
  isOnline,
  queuedActions,
  lastSyncEvent,
  onUnpair,
}: {
  devices: PairedDevice[];
  isOnline: boolean;
  queuedActions: number;
  lastSyncEvent: string | null;
  onUnpair: (deviceId: string) => void;
}) {
  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryTitle}>Paired fleet snapshot</Text>
                <Text style={styles.summaryText}>
                  {devices.length} paired devices
                </Text>
                <Text style={styles.summaryText}>
                  {queuedActions} queued sync action{queuedActions === 1 ? '' : 's'}
                </Text>
              </View>
              <View
                style={[
                  styles.networkPill,
                  isOnline ? styles.onlinePill : styles.offlinePill,
                ]}>
                <Text
                  style={[
                    styles.networkPillText,
                    isOnline ? styles.onlineText : styles.offlineText,
                  ]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            {lastSyncEvent ? <Text style={styles.eventText}>{lastSyncEvent}</Text> : null}
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.itemWrap}>
            <DeviceCard variant="paired" device={item} onPress={() => onUnpair(item.id)} />
            <Pressable style={styles.unpairButton} onPress={() => onUnpair(item.id)}>
              <Text style={styles.unpairText}>Unpair device</Text>
            </Pressable>
            {item.lastSyncError ? (
              <Text style={styles.errorText}>{item.lastSyncError}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No paired devices yet</Text>
            <Text style={styles.emptyText}>
              Paired devices will appear here with their cloud sync health and connection
              status.
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
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#d8e2ec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#13324b',
  },
  summaryText: {
    marginTop: 4,
    color: '#61758a',
  },
  networkPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  onlinePill: {
    backgroundColor: '#dff7ea',
  },
  offlinePill: {
    backgroundColor: '#fde5e3',
  },
  networkPillText: {
    fontWeight: '800',
  },
  onlineText: {
    color: '#157347',
  },
  offlineText: {
    color: '#b42318',
  },
  eventText: {
    color: '#526579',
    lineHeight: 20,
  },
  listContent: {
    gap: 14,
    flexGrow: 1,
    paddingBottom: 40,
  },
  itemWrap: {
    gap: 10,
  },
  unpairButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#fde5e3',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unpairText: {
    color: '#b42318',
    fontWeight: '700',
  },
  errorText: {
    color: '#b42318',
    fontSize: 12,
    lineHeight: 18,
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
