import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SyncStatus } from '../types/device';

const toneByStatus: Record<SyncStatus, {background: string; text: string; label: string}> =
  {
    synced: {
      background: '#dff7ea',
      text: '#157347',
      label: 'Synced',
    },
    pending: {
      background: '#fff1d6',
      text: '#9a6700',
      label: 'Pending',
    },
    failed: {
      background: '#fde5e3',
      text: '#b42318',
      label: 'Failed',
    },
  };

export function SyncStatusBadge({status}: {status: SyncStatus}) {
  const tone = toneByStatus[status];

  return (
    <View style={[styles.badge, {backgroundColor: tone.background}]}>
      <Text style={[styles.text, {color: tone.text}]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
