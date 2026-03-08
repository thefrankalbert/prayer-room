import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { VersePack } from '../../../src/types';
import { getAllPacks } from '../../../src/storage/packs';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';

const CATEGORY_COLORS: Record<string, string> = {
  healing: '#4ecb71',
  encouragement: '#4e9ccb',
  prosperity: '#c9a84c',
  faith: '#b478c8',
  protection: '#cb824e',
  love: '#e05c7a',
  wisdom: '#7c8cc8',
  praise: '#d4a84c',
  peace: '#5cb8a5',
  family: '#c87a4e',
  work: '#7a9c4e',
  forgiveness: '#9c7ab8',
  strength: '#c85c5c',
  joy: '#e0a030',
  custom: '#8b8a99',
};

export default function PacksListScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [packs, setPacks] = useState<VersePack[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPacks(language).then(setPacks);
    }, [language])
  );

  function renderPack({ item, index }: { item: VersePack; index: number }) {
    const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.custom;
    const isLast = index === packs.length - 1;

    return (
      <View>
        <Pressable
          onPress={() => router.push(`/(tabs)/packs/${item.id}`)}
          style={styles.row}
        >
          <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
          <Text style={[styles.packName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.verseCount, { color: colors.textMuted }]}>
            {item.verses.length}
          </Text>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>{'\u203A'}</Text>
        </Pressable>
        {!isLast && (
          <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.lg }]}>
      <Text style={[styles.header, { color: colors.text }]}>{t('packs.title')}</Text>

      {packs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('packs.empty')}
          </Text>
        </View>
      ) : (
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <FlatList
            data={packs}
            keyExtractor={(item) => item.id}
            renderItem={renderPack}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Browse Bible */}
      <Pressable
        onPress={() => router.push('/(tabs)/packs/bible')}
        style={[styles.bibleButton, { borderColor: colors.primary }]}
      >
        <Ionicons name="book-outline" size={20} color={colors.primary} />
        <Text style={[styles.bibleButtonText, { color: colors.primary }]}>{t('packs.browse_bible')}</Text>
      </Pressable>

      {/* Create button */}
      <Pressable
        onPress={() => router.push('/(tabs)/packs/create')}
        style={[styles.createButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.createButtonText}>{t('packs.create')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: FontSize.title,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  groupCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  packName: {
    fontSize: FontSize.md,
    flex: 1,
  },
  verseCount: {
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  separator: {
    height: 0.33,
    marginLeft: Spacing.md + 8 + Spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: FontSize.md,
  },
  createButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
  bibleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  bibleButtonText: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
});
