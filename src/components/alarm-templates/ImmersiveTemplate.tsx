import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_THRESHOLD = SCREEN_WIDTH * 0.5;

interface AlarmTemplateProps {
  verseText: string;
  verseReference: string;
  alarmName: string;
  onSilence: () => void;
  onClose: () => void;
  onSnooze: () => void;
}

export function ImmersiveTemplate({ verseText, verseReference, onClose, onSilence }: AlarmTemplateProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [prayerMode, setPrayerMode] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          slideX.setValue(gesture.dx);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SLIDE_THRESHOLD) {
          Animated.timing(slideX, { toValue: SCREEN_WIDTH, duration: 200, useNativeDriver: true }).start(() => {
            onSilence();
            setPrayerMode(true);
          });
        } else {
          Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (prayerMode) {
    return (
      <View style={[styles.container, { backgroundColor: '#000000' }]}>
        <View style={styles.prayerContent}>
          <Text style={[styles.verseText, { color: '#FFFFFF' }]}>{verseText}</Text>
          <Text style={[styles.reference, { color: colors.primary }]}>{verseReference}</Text>
        </View>
        <Pressable onPress={onClose} style={[styles.finishButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.finishText}>{t('triggered.finish')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <View style={styles.verseContainer}>
        <Text style={[styles.verseTextGlow, { color: '#FFFFFF', textShadowColor: colors.primary }]}>
          {verseText}
        </Text>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {verseReference}
        </Text>
      </View>

      <View style={styles.sliderArea}>
        <View style={[styles.sliderTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.sliderThumb, { backgroundColor: colors.primary, transform: [{ translateX: slideX }] }]}
          >
            <Text style={styles.sliderArrow}>{'\u203A'}</Text>
          </Animated.View>
          <Text style={[styles.sliderLabel, { color: 'rgba(255,255,255,0.4)' }]}>
            {t('triggered.slide_to_pray')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  verseText: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: Spacing.xl,
  },
  verseTextGlow: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: Spacing.xl,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  prayerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  finishButton: {
    marginBottom: Spacing.xxxl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
  },
  finishText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
  sliderArea: {
    position: 'absolute',
    bottom: Spacing.xxxl,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  sliderTrack: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderThumb: {
    position: 'absolute',
    left: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000000',
  },
  sliderLabel: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
});
