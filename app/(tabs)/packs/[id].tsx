import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { VersePack, Verse } from '../../../src/types';
import { getAllPacks, saveCustomPack, deleteCustomPack } from '../../../src/storage/packs';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';

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
        style={styles.verseItem}
      >
        <View style={[styles.verseAccent, { backgroundColor: colors.primary }]} />
        <View style={styles.verseBody}>
          <Text style={[styles.verseReference, { color: colors.text }]}>{item.reference}</Text>
          <Text style={[styles.verseText, { color: colors.textSecondary }]}>{item.text}</Text>
        </View>
      </Pressable>
    );
  }

  function renderSeparator() {
    return <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />;
  }

  if (!pack) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.lg }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.lg }]}>
      {/* Title area */}
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>{pack.name}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {pack.verses.length} verset{pack.verses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Verse list */}
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
                onPress={() => router.push(`/(tabs)/packs/create?editId=${pack.id}`)}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.addButtonText}>Ajouter un verset</Text>
              </Pressable>
              <Pressable onPress={handleDeletePack} style={styles.deleteButton}>
                <Text style={[styles.deleteText, { color: colors.danger }]}>
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
  headerSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  verseItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },
  verseAccent: {
    width: 2,
    borderRadius: 1,
    marginRight: Spacing.md,
  },
  verseBody: {
    flex: 1,
  },
  verseReference: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  verseText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  separator: {
    height: 0.33,
    marginLeft: 2 + Spacing.md,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.xxl,
    fontSize: FontSize.md,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  addButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
  deleteButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
});
