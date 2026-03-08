import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AlarmTemplate } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface TemplatePickerProps {
  value: AlarmTemplate;
  onChange: (template: AlarmTemplate) => void;
}

const TEMPLATES: { id: AlarmTemplate; icon: string; labelKey: string }[] = [
  { id: 'standard', icon: 'reader-outline', labelKey: 'alarm.template.standard' },
  { id: 'incoming-call', icon: 'call-outline', labelKey: 'alarm.template.incoming_call' },
  { id: 'wake-up', icon: 'alarm-outline', labelKey: 'alarm.template.wake_up' },
  { id: 'immersive', icon: 'sparkles-outline', labelKey: 'alarm.template.immersive' },
];

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {TEMPLATES.map((tmpl) => {
        const selected = value === tmpl.id;
        return (
          <Pressable
            key={tmpl.id}
            onPress={() => onChange(tmpl.id)}
            style={[
              styles.card,
              {
                backgroundColor: selected ? colors.accentSoft : colors.card,
                borderColor: selected ? colors.primary : colors.borderLight,
                borderWidth: selected ? 1.5 : 0.33,
              },
            ]}
          >
            <Ionicons
              name={tmpl.icon as any}
              size={24}
              color={selected ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                { color: selected ? colors.primary : colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {t(tmpl.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});
