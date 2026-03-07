import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { VersePack, Verse } from '../../src/types';
import { getAllPacks, saveCustomPack, deleteCustomPack } from '../../src/storage/packs';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [pack, setPack] = useState<VersePack | null>(null);

  const isCustom = pack ? !pack.isBuiltin && !pack.isDownloaded : false;

  useFocusEffect(
    useCallback(() => {
      getAllPacks().then((packs) => {
        const found = packs.find((p) => p.id === id);
        setPack(found ?? null);
      });
    }, [id])
  );

  function handleDeleteVerse(index: number) {
    if (!pack || !isCustom) return;
    Alert.alert('Supprimer le verset', `Supprimer "${pack.verses[index].reference}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const updated = {
            ...pack,
            verses: pack.verses.filter((_, i) => i !== index),
          };
          await saveCustomPack(updated);
          setPack(updated);
        },
      },
    ]);
  }

  function handleDeletePack() {
    if (!pack) return;
    Alert.alert('Supprimer le pack', `Supprimer "${pack.name}" et tous ses versets ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteCustomPack(pack.id);
          router.back();
        },
      },
    ]);
  }

  function renderVerse({ item, index }: { item: Verse; index: number }) {
    return (
      <Pressable
        onLongPress={() => isCustom && handleDeleteVerse(index)}
        style={[styles.verseCard, Shadow.sm, { backgroundColor: colors.card }]}
      >
        <View style={[styles.verseGoldBorder, { backgroundColor: colors.primary }]} />
        <View style={styles.verseBody}>
          <Text style={[styles.reference, { color: colors.primary }]}>{item.reference}</Text>
          <Text style={[styles.verseText, { color: colors.text }]}>{item.text}</Text>
        </View>
      </Pressable>
    );
  }

  function renderSeparator() {
    return <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />;
  }

  if (!pack) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.md }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.md }]}>
      <View style={[styles.headerCard, Shadow.sm, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{pack.name}</Text>
        {pack.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>{pack.description}</Text>
        ) : null}
        <View style={[styles.headerCountPill, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.headerCountText, { color: colors.primary }]}>
            {pack.verses.length} verset{pack.verses.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FlatList
        data={pack.verses}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderVerse}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isCustom ? (
            <View style={styles.footer}>
              <Pressable
                onPress={() => router.push(`/packs/create?editId=${pack.id}`)}
                style={[styles.editButton, Shadow.gold, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.editButtonText, { color: colors.background }]}>
                  Ajouter un verset
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeletePack}
                style={[styles.deleteButton, { borderColor: colors.borderLight }]}
              >
                <Text style={[styles.deleteButtonText, { color: colors.textMuted }]}>
                  Supprimer le pack
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  headerCountPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  headerCountText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  verseCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  verseGoldBorder: {
    width: 3,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  verseBody: {
    flex: 1,
    padding: Spacing.lg,
  },
  reference: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  verseText: {
    fontSize: FontSize.md,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    marginVertical: Spacing.sm,
    marginLeft: Spacing.xxxl,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.xxl,
    fontSize: FontSize.md,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  editButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  deleteButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
