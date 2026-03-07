import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { stopAudio } from '../src/services/audio';
import { Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';

export default function AlarmTriggeredScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { verseReference, verseText, alarmName } = useLocalSearchParams<{
    verseReference: string;
    verseText: string;
    alarmName: string;
  }>();

  async function handleClose() {
    await stopAudio();
    router.back();
  }

  async function handleStopMusic() {
    await stopAudio();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top decoration */}
      <View style={styles.topDecor}>
        <View style={[styles.decorLine, { backgroundColor: colors.primaryDim }]} />
        <Text style={[styles.decorSymbol, { color: colors.primary }]}>{'\u2726'}</Text>
        <View style={[styles.decorLine, { backgroundColor: colors.primaryDim }]} />
      </View>

      {/* Alarm name */}
      <Text style={[styles.alarmName, { color: colors.textMuted }]}>
        {alarmName || 'Prayer Room'}
      </Text>

      {/* Verse */}
      <View style={styles.verseContainer}>
        <Text style={[styles.quoteOpen, { color: colors.primaryDim }]}>{'\u201C'}</Text>
        <Text style={[styles.verseText, { color: colors.text }]}>
          {verseText || ''}
        </Text>
        <Text style={[styles.quoteClose, { color: colors.primaryDim }]}>{'\u201D'}</Text>
      </View>

      {/* Reference */}
      <View style={[styles.referenceBadge, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {verseReference || ''}
        </Text>
      </View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecor}>
        <View style={[styles.decorLineThin, { backgroundColor: colors.border }]} />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable
          onPress={handleStopMusic}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.md }}>
            Arreter la musique
          </Text>
        </Pressable>
        <Pressable
          onPress={handleClose}
          style={[styles.primaryButton, { backgroundColor: colors.primary }, Shadow.gold]}
        >
          <Text style={{ color: colors.background, fontSize: FontSize.lg, fontWeight: '700' }}>
            Amen — Fermer
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
    padding: Spacing.xl,
  },
  topDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  decorLine: { width: 40, height: 1 },
  decorSymbol: { fontSize: 16 },
  decorLineThin: { width: 60, height: StyleSheet.hairlineWidth },
  alarmName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: Spacing.xxl,
  },
  verseContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    maxWidth: '90%',
  },
  quoteOpen: {
    fontSize: 72,
    lineHeight: 72,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: -20,
    alignSelf: 'flex-start',
  },
  verseText: {
    fontSize: 22,
    lineHeight: 34,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  quoteClose: {
    fontSize: 72,
    lineHeight: 72,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginTop: -12,
    alignSelf: 'flex-end',
  },
  referenceBadge: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bottomDecor: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  buttons: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: Spacing.xl,
    right: Spacing.xl,
    gap: Spacing.md,
  },
  secondaryButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  primaryButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
});
