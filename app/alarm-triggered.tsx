import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { stopAudio } from '../src/services/audio';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

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
      <Text style={[styles.alarmName, { color: colors.textSecondary }]}>
        {alarmName || 'Prayer Room'}
      </Text>

      <View style={styles.verseContainer}>
        <Text style={[styles.reference, { color: colors.primary }]}>
          {verseReference || ''}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.primary }]} />
        <Text style={[styles.verseText, { color: colors.text }]}>
          {verseText || ''}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Pressable onPress={handleStopMusic} style={[styles.secondaryButton, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.md }}>Arreter la musique</Text>
        </Pressable>
        <Pressable onPress={handleClose} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors.background, fontSize: FontSize.lg, fontWeight: '700' }}>Fermer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  alarmName: { fontSize: FontSize.md, marginBottom: Spacing.xl, textTransform: 'uppercase', letterSpacing: 2 },
  verseContainer: { alignItems: 'center', paddingHorizontal: Spacing.lg, maxWidth: '90%' },
  reference: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1.5 },
  divider: { width: 60, height: 2, marginBottom: Spacing.lg, borderRadius: 1 },
  verseText: { fontSize: FontSize.xl, fontStyle: 'italic', textAlign: 'center', lineHeight: 36 },
  buttons: { position: 'absolute', bottom: Spacing.xxl, width: '100%', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  secondaryButton: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  primaryButton: { padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
});
