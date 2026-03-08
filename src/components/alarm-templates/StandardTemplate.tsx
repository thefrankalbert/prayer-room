import React from 'react';
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

export function StandardTemplate({ verseText, verseReference, onSilence, onClose }: AlarmTemplateProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.verseContainer}>
        <Text style={[styles.verseText, { color: colors.text }]}>
          {verseText}
        </Text>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {verseReference}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={onSilence}
          style={[styles.secondaryButton, { borderColor: colors.borderLight }]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
            {t('triggered.silence')}
          </Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.primaryButtonText}>
            {t('triggered.close')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    maxWidth: '90%',
  },
  verseText: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: Spacing.xl,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttons: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '400',
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
});
