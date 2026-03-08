import { View, Text, FlatList, StyleSheet, Pressable, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { VersePack, Verse } from '../../../src/types';
import { getAllPacks, saveCustomPack, deleteCustomPack } from '../../../src/storage/packs';
import { getAlarms, saveAlarm } from '../../../src/storage/alarms';
import { scheduleAlarm } from '../../../src/services/notifications';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [pack, setPack] = useState<VersePack | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isCustom = pack ? !pack.isBuiltin && !pack.isDownloaded : false;

  useFocusEffect(
    useCallback(() => {
      getAllPacks(language).then((packs) => {
        const found = packs.find((p) => p.id === id);
        setPack(found ?? null);
      });
    }, [id, language])
  );

  function handleVersePress(verse: Verse, index: number) {
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    // Show action sheet
    Alert.alert(
      verse.reference,
      verse.text,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: language === 'fr' ? 'Partager' : 'Share',
          onPress: () => {
            Share.share({
              message: `${verse.text}\n\n— ${verse.reference}`,
            });
          },
        },
      ]
    );
  }

  function handleDeleteVerse(index: number) {
    if (!pack || !isCustom) return;
    Alert.alert(t('common.delete'), t('packs.delete_verse_confirm', { ref: pack.verses[index].reference }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
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

  async function handleUsePack() {
    if (!pack) return;
    const alarms = await getAlarms();

    if (alarms.length === 0) {
      // Go create a new alarm with this pack pre-selected
      router.push(`/alarm/new?packId=${pack.id}`);
      return;
    }

    // Show alarm picker
    Alert.alert(
      language === 'fr' ? 'Assigner à une alarme' : 'Assign to alarm',
      language === 'fr' ? 'Choisir l\'alarme qui utilisera ce pack' : 'Choose the alarm to use this pack',
      [
        ...alarms.map((alarm) => ({
          text: alarm.name,
          onPress: async () => {
            const updated = { ...alarm, packId: pack.id };
            await saveAlarm(updated);
            await scheduleAlarm(updated);
            Alert.alert(
              '✓',
              language === 'fr'
                ? `"${pack.name}" assigné à "${alarm.name}"`
                : `"${pack.name}" assigned to "${alarm.name}"`
            );
          },
        })),
        {
          text: language === 'fr' ? 'Nouvelle alarme' : 'New alarm',
          onPress: () => router.push(`/alarm/new?packId=${pack.id}`),
        },
        { text: t('common.cancel'), style: 'cancel' as const },
      ]
    );
  }

  function handleDeletePack() {
    if (!pack) return;
    Alert.alert(t('packs.delete'), t('packs.delete_confirm', { name: pack.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteCustomPack(pack.id);
          router.back();
        },
      },
    ]);
  }

  // Filter out verses with empty or truncated text (< 10 chars usually means bad data)
  const validVerses = pack?.verses.filter((v) => v.text.length >= 10 && v.reference.length > 0) || [];

  function renderVerse({ item, index }: { item: Verse; index: number }) {
    return (
      <Pressable
        onPress={() => handleVersePress(item, index)}
        onLongPress={() => isCustom && handleDeleteVerse(index)}
        style={styles.verseItem}
      >
        <View style={[styles.verseAccent, { backgroundColor: colors.primary }]} />
        <View style={styles.verseBody}>
          <Text style={[styles.verseReference, { color: colors.primary }]}>{item.reference}</Text>
          <Text style={[styles.verseText, { color: colors.textSecondary }]} numberOfLines={4}>
            {item.text}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} style={styles.moreIcon} />
      </Pressable>
    );
  }

  if (!pack) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.lg }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={validVerses}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderVerse}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 160, paddingHorizontal: Spacing.lg }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.headerSection, { paddingTop: insets.top + Spacing.lg }]}>
            {/* Back button */}
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
            {/* Pack info */}
            <Text style={[styles.title, { color: colors.text }]}>{pack.name}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('packs.verses_count', { count: validVerses.length })}
            </Text>
            {pack.description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{pack.description}</Text>
            ) : null}
          </View>
        }
        ListFooterComponent={
          isCustom ? (
            <View style={styles.footer}>
              <Pressable
                onPress={() => router.push(`/(tabs)/packs/create?editId=${pack.id}`)}
                style={[styles.outlineButton, { borderColor: colors.primary }]}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={[styles.outlineButtonText, { color: colors.primary }]}>{t('packs.add_verse_btn')}</Text>
              </Pressable>
              <Pressable onPress={handleDeletePack} style={styles.deleteButton}>
                <Text style={[styles.deleteText, { color: colors.danger }]}>
                  {t('packs.delete')}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      {/* FAB — Use this pack */}
      <Pressable
        onPress={handleUsePack}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 90 }]}
      >
        <Ionicons name="alarm-outline" size={22} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    marginBottom: Spacing.lg,
  },
  backBtn: {
    marginBottom: Spacing.md,
    padding: Spacing.xs,
    alignSelf: 'flex-start',
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
  description: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  verseItem: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    alignItems: 'flex-start',
  },
  verseAccent: {
    width: 2.5,
    borderRadius: 1.25,
    marginRight: Spacing.md,
    alignSelf: 'stretch',
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
  moreIcon: {
    paddingTop: 4,
    paddingLeft: Spacing.sm,
  },
  separator: {
    height: 0.33,
    marginLeft: 2.5 + Spacing.md,
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
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
