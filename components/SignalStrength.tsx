import React from 'react';
import { StyleSheet, View } from 'react-native';

function getBarCount(rssi: number | null): number {
  if (rssi === null) {
    return 0;
  }

  if (rssi >= -55) {
    return 4;
  }

  if (rssi >= -67) {
    return 3;
  }

  if (rssi >= -80) {
    return 2;
  }

  return 1;
}

export function SignalStrength({rssi}: {rssi: number | null}) {
  const activeBars = getBarCount(rssi);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4].map(level => (
        <View
          key={level}
          style={[
            styles.bar,
            {height: 5 + level * 4},
            level <= activeBars ? styles.activeBar : styles.inactiveBar,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    minWidth: 28,
  },
  bar: {
    width: 4,
    borderRadius: 999,
  },
  activeBar: {
    backgroundColor: '#00b26f',
  },
  inactiveBar: {
    backgroundColor: '#cad5e2',
  },
});
