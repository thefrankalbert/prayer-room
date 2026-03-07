import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../types';
import { Spacing, FontSize } from '../constants/theme';

interface Props {
  verse: Verse | null;
}

export function VerseCard({ verse }: Props) {
  const { colors } = useTheme();
  if (!verse) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.text }]}>
        {'\u201C'}{verse.text}{'\u201D'}
      </Text>
      <Text style={[styles.reference, { color: colors.primary }]}>
        {verse.reference}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  text: {
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 34,
    letterSpacing: -0.3,
    fontStyle: 'italic',
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: Spacing.md,
  },
});
