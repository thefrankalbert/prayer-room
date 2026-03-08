import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';
import bibleMeta from '../../../src/data/bible-meta.json';
import { BIBLE_TRANSLATIONS } from '../../../src/data/bible-translations';

interface BookMeta {
  id: string;
  name_fr: string;
  name_en: string;
  chapters: number;
  testament: string;
  order: number;
}

export default function BibleBrowserScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [translationKey, setTranslationKey] = useState(language === 'fr' ? 'ls1910' : 'kjv');

  const books = (bibleMeta as BookMeta[]).filter((b) => {
    if (!search.trim()) return true;
    const name = language === 'fr' ? b.name_fr : b.name_en;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const oldTestament = books.filter((b) => b.testament === 'old');
  const newTestament = books.filter((b) => b.testament === 'new');

  function renderBook(book: BookMeta) {
    const name = language === 'fr' ? book.name_fr : book.name_en;
    return (
      <Pressable
        key={book.id}
        onPress={() => router.push({
          pathname: '/(tabs)/packs/bible-chapter',
          params: { bookId: book.id, translationKey },
        })}
        style={styles.bookRow}
      >
        <Text style={[styles.bookName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.chapterCount, { color: colors.textMuted }]}>{book.chapters}</Text>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>{'\u203A'}</Text>
      </Pressable>
    );
  }

  function renderSection(title: string, data: BookMeta[]) {
    if (data.length === 0) return null;
    return (
      <View>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{title}</Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          {data.map((book, index) => (
            <View key={book.id}>
              {renderBook(book)}
              {index < data.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  const currentTranslation = BIBLE_TRANSLATIONS.find((tr) => tr.key === translationKey);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.lg }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.header, { color: colors.text }]}>{t('bible.title')}</Text>
        <Pressable
          onPress={() => setTranslationKey(translationKey === 'ls1910' ? 'kjv' : 'ls1910')}
          style={[styles.translationPill, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
        >
          <Text style={[styles.translationText, { color: colors.primary }]}>
            {currentTranslation?.name.split(' ')[0] || translationKey.toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('bible.search_placeholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        renderItem={() => (
          <>
            {renderSection(t('bible.old_testament'), oldTestament)}
            {renderSection(t('bible.new_testament'), newTestament)}
          </>
        )}
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
    marginBottom: Spacing.lg,
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
  translationPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 0.33,
  },
  translationText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    padding: 0,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  groupCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    overflow: 'hidden',
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
  },
  bookName: {
    fontSize: FontSize.md,
    flex: 1,
  },
  chapterCount: {
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  separator: {
    height: 0.33,
    marginLeft: Spacing.md,
  },
});
