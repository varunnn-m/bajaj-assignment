import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type AppTab = 'scan' | 'paired';

export function SectionTabs({
  value,
  onChange,
}: {
  value: AppTab;
  onChange: (tab: AppTab) => void;
}) {
  return (
    <View style={styles.container}>
      {(['scan', 'paired'] as AppTab[]).map(tab => {
        const active = tab === value;
        const label = tab === 'scan' ? 'Scan Devices' : 'Paired Devices';

        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tab, active && styles.activeTab]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#d7e5ee',
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  label: {
    color: '#526579',
    fontWeight: '700',
  },
  activeLabel: {
    color: '#13324b',
  },
});
