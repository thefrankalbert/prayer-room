import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

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
      <Text style={[styles.label, { color: colors.textMuted }]}>INTERVALLE</Text>
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
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.accentSoft,
                  borderColor: selected ? colors.primary : 'transparent',
                },
                selected && Shadow.gold,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? colors.background : colors.text },
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
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
