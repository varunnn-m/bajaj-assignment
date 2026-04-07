import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function PermissionNotice({
  title,
  message,
  onPress,
}: {
  title: string;
  message: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Open settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#13324b',
    padding: 16,
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  message: {
    color: '#d4e5f4',
    lineHeight: 20,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  buttonText: {
    color: '#13324b',
    fontWeight: '700',
  },
});
