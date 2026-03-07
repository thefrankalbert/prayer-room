import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
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
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(formatTime(selectedDate));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.timeText, { color: colors.text }]}>{value}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          themeVariant={mode}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  timeText: {
    fontSize: FontSize.hero,
    fontWeight: '200',
    letterSpacing: -1,
  },
});
