import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

const PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '40 min', minutes: 40 },
  { label: '1h', minutes: 60 },
  { label: '1h30', minutes: 90 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
];

interface IntervalPickerProps {
  value: number;
  onChange: (minutes: number) => void;
}

export function IntervalPicker({ value, onChange }: IntervalPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PRESETS.map((preset) => {
          const selected = value === preset.minutes;
          return (
            <Pressable
              key={preset.minutes}
              onPress={() => onChange(preset.minutes)}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? colors.primary : colors.card,
                  borderColor: selected ? colors.primary : colors.borderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: selected ? '#000000' : colors.text },
                ]}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 0.33,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
