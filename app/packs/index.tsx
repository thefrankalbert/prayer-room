import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { VersePack } from '../../src/types';
import { getAllPacks } from '../../src/storage/packs';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

const CATEGORY_LABELS: Record<VersePack['category'], string> = {
  healing: 'Guerison',
  encouragement: 'Encouragement',
  prosperity: 'Prosperite',
  faith: 'Foi',
  protection: 'Protection',
  custom: 'Personnalise',
};

export default function PacksListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [packs, setPacks] = useState<VersePack[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllPacks().then(setPacks);
    }, [])
  );

  function renderPack({ item }: { item: VersePack }) {
    const isCustom = !item.isBuiltin && !item.isDownloaded;
    return (
      <Pressable
        onPress={() => router.push(`/packs/${item.id}`)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.packName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.badges}>
            {item.isBuiltin && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>Integre</Text>
              </View>
            )}
            {isCustom && (
              <View style={[styles.badge, { backgroundColor: colors.success }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>Editable</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {CATEGORY_LABELS[item.category]}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.verseCount, { color: colors.textSecondary }]}>
          {item.verses.length} verset{item.verses.length !== 1 ? 's' : ''}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Packs de versets</Text>

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
        />
      )}

      <Pressable
        onPress={() => router.push('/packs/create')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.fabText, { color: colors.background }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl },
  header: { fontSize: FontSize.xxl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  packName: { fontSize: FontSize.lg, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  badges: { flexDirection: 'row', gap: Spacing.xs },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  description: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.xs },
  verseCount: { fontSize: 12, fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { textAlign: 'center', fontSize: FontSize.md, lineHeight: 24 },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, fontWeight: '700', marginTop: -2 },
});
