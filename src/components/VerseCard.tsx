import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../types';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

interface Props {
  verse: Verse | null;
}

export function VerseCard({ verse }: Props) {
  const { colors } = useTheme();
  if (!verse) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.md]}>
      <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <Text style={[styles.quoteOpen, { color: colors.primaryDim }]}>{'\u201C'}</Text>
        <Text style={[styles.text, { color: colors.text }]}>{verse.text}</Text>
        <Text style={[styles.quoteClose, { color: colors.primaryDim }]}>{'\u201D'}</Text>
        <View style={[styles.referenceLine, { backgroundColor: colors.accentSoft }]} />
        <Text style={[styles.reference, { color: colors.primary }]}>{verse.reference}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    overflow: 'hidden',
  },
  accentLine: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  quoteOpen: {
    fontSize: 56,
    lineHeight: 56,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: -16,
    marginLeft: -4,
  },
  text: {
    fontSize: FontSize.lg,
    lineHeight: 30,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    paddingHorizontal: Spacing.xs,
  },
  quoteClose: {
    fontSize: 56,
    lineHeight: 56,
    fontFamily: 'Georgia',
    fontWeight: '700',
    textAlign: 'right',
    marginTop: -8,
    marginRight: -4,
  },
  referenceLine: {
    height: 1,
    marginVertical: Spacing.md,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
