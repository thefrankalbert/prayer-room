import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { VersePack, Verse } from '../../src/types';
import { getAllPacks, saveCustomPack, deleteCustomPack } from '../../src/storage/packs';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
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
        style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.reference, { color: colors.primary }]}>{item.reference}</Text>
        <Text style={[styles.verseText, { color: colors.text }]}>{item.text}</Text>
      </Pressable>
    );
  }

  if (!pack) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{pack.name}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{pack.description}</Text>
      <Text style={[styles.count, { color: colors.textSecondary }]}>
        {pack.verses.length} verset{pack.verses.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={pack.verses}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderVerse}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          isCustom ? (
            <View style={styles.footer}>
              <Pressable
                onPress={() => router.push(`/packs/create?editId=${pack.id}`)}
                style={[styles.addVerseButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.addVerseText, { color: colors.background }]}>
                  Ajouter un verset
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeletePack}
                style={[styles.deleteButton, { borderColor: colors.danger }]}
              >
                <Text style={{ color: colors.danger, fontSize: FontSize.md, fontWeight: '600' }}>
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
  container: { flex: 1, paddingTop: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.xs },
  description: { fontSize: FontSize.md, paddingHorizontal: Spacing.md, lineHeight: 22, marginBottom: Spacing.xs },
  count: { fontSize: FontSize.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  verseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verseText: {
    fontSize: FontSize.md,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  emptyText: { textAlign: 'center', marginTop: Spacing.xxl, fontSize: FontSize.md },
  footer: { marginTop: Spacing.md, gap: Spacing.sm },
  addVerseButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addVerseText: { fontSize: FontSize.md, fontWeight: '700' },
  deleteButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
  },
});
