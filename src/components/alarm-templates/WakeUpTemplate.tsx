import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface AlarmTemplateProps {
  verseText: string;
  verseReference: string;
  alarmName: string;
  onSilence: () => void;
  onClose: () => void;
  onSnooze: () => void;
}

function formatTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function WakeUpTemplate({ verseText, verseReference, onSnooze, onClose }: AlarmTemplateProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const interval = global.setInterval(() => setTime(formatTime()), 10000);
    return () => global.clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.time, { color: colors.text }]}>{time}</Text>

      <View style={styles.verseSection}>
        <Text style={[styles.verseText, { color: colors.text }]}>
          {verseText}
        </Text>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {verseReference}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={onSnooze}
          style={[styles.snoozeButton, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
        >
          <Text style={[styles.snoozeText, { color: colors.text }]}>{t('triggered.snooze')}</Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          style={[styles.stopButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.stopText}>{t('triggered.stop')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxxl,
  },
  time: {
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: -2,
    marginTop: Spacing.xxl,
  },
  verseSection: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  verseText: {
    fontSize: FontSize.lg,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  reference: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  buttons: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  snoozeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    alignItems: 'center',
  },
  snoozeText: {
    fontSize: FontSize.md,
    fontWeight: '400',
  },
  stopButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  stopText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
});
