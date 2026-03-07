import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  verse: Verse | null;
}

export function VerseCard({ verse }: Props) {
  const { colors } = useTheme();
  if (!verse) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.reference, { color: colors.primary }]}>{verse.reference}</Text>
      <Text style={[styles.text, { color: colors.text }]}>{verse.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
