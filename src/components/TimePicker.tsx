import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, FontSize } from '../constants/theme';

interface TimePickerProps {
  label: string;
  value: string; // "HH:mm"
  onChange: (time: string) => void;
}

function parseTime(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  const { colors, mode } = useTheme();

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(formatTime(selectedDate));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      <DateTimePicker
        value={parseTime(value)}
        mode="time"
        is24Hour={true}
        display={Platform.OS === 'ios' ? 'compact' : 'default'}
        onChange={handleChange}
        themeVariant={mode}
        accentColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
});
