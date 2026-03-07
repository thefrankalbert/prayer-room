import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { stopAudio } from '../src/services/audio';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function AlarmTriggeredScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { verseReference, verseText } = useLocalSearchParams<{
    verseReference: string;
    verseText: string;
    alarmName: string;
  }>();

  async function handleClose() {
    await stopAudio();
    router.back();
  }

  async function handleSilence() {
    await stopAudio();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Verse - centered, the Word speaks for itself */}
      <View style={styles.verseContainer}>
        <Text style={[styles.verseText, { color: colors.text }]}>
          {verseText || ''}
        </Text>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {verseReference || ''}
        </Text>
      </View>

      {/* Buttons at bottom */}
      <View style={[styles.buttons, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={handleSilence}
          style={[styles.secondaryButton, { borderColor: colors.borderLight }]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
            Silence
          </Text>
        </Pressable>
        <Pressable
          onPress={handleClose}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.primaryButtonText}>
            Fermer
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
