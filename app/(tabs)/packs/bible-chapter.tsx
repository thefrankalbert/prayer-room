import { View, Text, FlatList, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';
import bibleMeta from '../../../src/data/bible-meta.json';
import { getAllPacks, saveCustomPack } from '../../../src/storage/packs';
import { getBibleBook } from '../../../src/data/bible-require-map';
import { VersePack } from '../../../src/types';

interface BookMeta {
  id: string;
  name_fr: string;
  name_en: string;
  chapters: number;
  testament: string;
  order: number;
}

export default function BibleChapterScreen() {
  const { bookId, translationKey } = useLocalSearchParams<{ bookId: string; translationKey: string }>();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const book = (bibleMeta as BookMeta[]).find((b) => b.id === bookId);
  const bookName = book ? (language === 'fr' ? book.name_fr : book.name_en) : bookId;
  const totalChapters = book?.chapters || 1;

  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<Record<string, string>>({});
  const [addedVerses, setAddedVerses] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChapter();
  }, [bookId, translationKey, chapter]);

  function loadChapter() {
    const data = getBibleBook(translationKey || 'ls1910', bookId || '');
    if (data) {
      setVerses(data[String(chapter)] || {});
    } else {
      setVerses({});
    }
  }

  async function handleAddToPack(verseNum: string, verseText: string) {
    const ref = `${bookName} ${chapter}:${verseNum}`;
    const packs = await getAllPacks(language);
    const customPacks = packs.filter((p) => !p.isBuiltin && !p.isDownloaded);

    if (customPacks.length === 0) {
      Alert.alert(t('packs.create'), t('packs.empty'));
      return;
    }

    Alert.alert(
      t('bible.add_to_pack'),
      ref,
      [
        ...customPacks.map((pack) => ({
          text: pack.name,
          onPress: async () => {
            const updated: VersePack = {
              ...pack,
              verses: [...pack.verses, { reference: ref, text: verseText }],
            };
            await saveCustomPack(updated);
            setAddedVerses((prev) => new Set(prev).add(`${chapter}:${verseNum}`));
          },
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ]
    );
  }

  const verseEntries = Object.entries(verses).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.lg }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.header, { color: colors.text }]} numberOfLines={1}>{bookName}</Text>
      </View>

      {/* Chapter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chapterScroll}
      >
        {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => {
          const selected = ch === chapter;
          return (
            <Pressable
              key={ch}
              onPress={() => setChapter(ch)}
              style={[styles.chapterPill, {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.borderLight,
              }]}
            >
              <Text style={[styles.chapterPillText, { color: selected ? '#000000' : colors.text }]}>
                {ch}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Verses */}
      <FlatList
        data={verseEntries}
        keyExtractor={([num]) => num}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: Spacing.lg }}
        renderItem={({ item: [num, text] }) => {
          const isAdded = addedVerses.has(`${chapter}:${num}`);
          return (
            <View style={styles.verseRow}>
              <Text style={[styles.verseNum, { color: colors.primary }]}>{num}</Text>
              <Text style={[styles.verseText, { color: colors.text }]}>{text}</Text>
              <Pressable
                onPress={() => handleAddToPack(num, text)}
                style={styles.addBtn}
              >
                {isAdded ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                ) : (
                  <Ionicons name="add-circle-outline" size={22} color={colors.textMuted} />
                )}
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('common.loading')}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  header: {
    fontSize: FontSize.title,
    fontWeight: '700',
    flex: 1,
  },
  chapterScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  chapterPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterPillText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  verseRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    alignItems: 'flex-start',
  },
  verseNum: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    width: 28,
    paddingTop: 2,
  },
  verseText: {
    fontSize: FontSize.md,
    lineHeight: 24,
    flex: 1,
  },
  addBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.xxl,
    fontSize: FontSize.md,
  },
});
