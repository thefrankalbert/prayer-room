import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export function IncomingCallTemplate({ verseText, verseReference, alarmName, onClose, onSnooze }: AlarmTemplateProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        <Animated.View style={[styles.iconCircle, { backgroundColor: colors.accentSoft, transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="book" size={36} color={colors.primary} />
        </Animated.View>
        <Text style={[styles.alarmName, { color: colors.text }]}>{alarmName}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('app.name')}</Text>
      </View>

      <View style={styles.verseSection}>
        <Text style={[styles.verseText, { color: colors.text }]} numberOfLines={6}>
          {verseText}
        </Text>
        <Text style={[styles.reference, { color: colors.primary }]}>{verseReference}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <Pressable onPress={onSnooze} style={styles.circleButtonWrap}>
          <View style={[styles.circleButton, { backgroundColor: '#FF3B30' }]}>
            <Ionicons name="close" size={28} color="#fff" />
          </View>
          <Text style={[styles.circleLabel, { color: colors.textSecondary }]}>{t('triggered.later')}</Text>
        </Pressable>

        <Pressable onPress={onClose} style={styles.circleButtonWrap}>
          <View style={[styles.circleButton, { backgroundColor: '#34C759' }]}>
            <Ionicons name="book" size={28} color="#fff" />
          </View>
          <Text style={[styles.circleLabel, { color: colors.textSecondary }]}>{t('triggered.pray')}</Text>
        </Pressable>
      </View>

      <Text style={[styles.snoozeText, { color: colors.textMuted }]}>{t('triggered.snooze')}</Text>
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
  topSection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  alarmName: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: '400',
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
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
  },
  circleButtonWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  snoozeText: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.lg,
  },
});
