import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { VersePack } from '../../src/types';
import { getAllPacks } from '../../src/storage/packs';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

const CATEGORY_LABELS: Record<VersePack['category'], string> = {
  healing: 'Guerison',
  encouragement: 'Encouragement',
  prosperity: 'Prosperite',
  faith: 'Foi',
  protection: 'Protection',
  custom: 'Personnalise',
};

const CATEGORY_COLORS: Record<VersePack['category'], { bg: string; text: string }> = {
  healing: { bg: 'rgba(78, 203, 113, 0.12)', text: '#4ecb71' },
  encouragement: { bg: 'rgba(78, 156, 203, 0.12)', text: '#4e9ccb' },
  prosperity: { bg: 'rgba(201, 168, 76, 0.12)', text: '#c9a84c' },
  faith: { bg: 'rgba(180, 120, 200, 0.12)', text: '#b478c8' },
  protection: { bg: 'rgba(203, 130, 78, 0.12)', text: '#cb824e' },
  custom: { bg: 'rgba(140, 140, 160, 0.12)', text: '#8b8a99' },
};

export default function PacksListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [packs, setPacks] = useState<VersePack[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPacks().then(setPacks);
    }, [])
  );

  function renderPack({ item }: { item: VersePack }) {
    const isCustom = !item.isBuiltin && !item.isDownloaded;
    const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.custom;

    return (
      <Pressable
        onPress={() => router.push(`/packs/${item.id}`)}
        style={[
          styles.card,
          Shadow.sm,
          { backgroundColor: colors.card },
        ]}
      >
        <View style={[styles.goldIndicator, { backgroundColor: colors.primary }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={[styles.packName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isBuiltin && (
              <Text style={[styles.builtinLabel, { color: colors.textMuted }]}>Integre</Text>
            )}
            {isCustom && (
              <View style={[styles.persoBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.persoBadgeText, { color: colors.primary }]}>Perso</Text>
              </View>
            )}
          </View>

          {item.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}>
              <Text style={[styles.categoryBadgeText, { color: catColor.text }]}>
                {CATEGORY_LABELS[item.category]}
              </Text>
            </View>
            <View style={[styles.countPill, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.countPillText, { color: colors.primary }]}>
                {item.verses.length} verset{item.verses.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.headerSection}>
        <Text style={[styles.header, { color: colors.text }]}>Versets</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choisissez un pack pour nourrir votre priere
        </Text>
      </View>

      {packs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucun pack disponible.
          </Text>
        </View>
      ) : (
        <FlatList
          data={packs}
          keyExtractor={(item) => item.id}
          renderItem={renderPack}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        onPress={() => router.push('/packs/create')}
        style={[styles.fab, Shadow.gold, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.fabText, { color: colors.background }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    fontSize: FontSize.title,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl + Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  goldIndicator: {
    width: 4,
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  packName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
  },
  builtinLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  persoBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  persoBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  countPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '600',
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
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: -2,
  },
});
