import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { Alarm, Verse } from '../../src/types';
import { getAlarms, saveAlarm } from '../../src/storage/alarms';
import { getAllPacks } from '../../src/storage/packs';
import { getNextVerse } from '../../src/storage/settings';
import { scheduleAlarm } from '../../src/services/notifications';
import { AlarmCard } from '../../src/components/AlarmCard';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const loaded = await getAlarms();
    setAlarms(loaded);
    const activeAlarm = loaded.find((a) => a.enabled);
    if (activeAlarm) {
      const packs = await getAllPacks();
      const pack = packs.find((p) => p.id === activeAlarm.packId);
      if (pack && pack.verses.length > 0) {
        const verse = await getNextVerse(pack.id, pack.verses);
        setCurrentVerse(verse);
      }
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;
    const updated = { ...alarm, enabled };
    await saveAlarm(updated);
    await scheduleAlarm(updated);
    setAlarms((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            {/* Minimal header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{t('home.title')}</Text>
              <Pressable
                onPress={() => router.push('/alarm/new')}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={22} color="#000" />
              </Pressable>
            </View>

            {/* Verse — the hero element */}
            <View style={styles.verseSection}>
              {currentVerse ? (
                <>
                  <Text style={[styles.verseText, { color: colors.text }]}>
                    {'\u201C'}{currentVerse.text}{'\u201D'}
                  </Text>
                  <Text style={[styles.verseRef, { color: colors.primary }]}>
                    {currentVerse.reference}
                  </Text>
                </>
              ) : (
                <Text style={[styles.versePlaceholder, { color: colors.textMuted }]}>
                  {t('home.verse_placeholder')}
                </Text>
              )}
            </View>

            {/* Separator */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {/* Alarms header */}
            <View style={styles.alarmsHeader}>
              <Text style={[styles.alarmsTitle, { color: colors.text }]}>{t('home.alarms')}</Text>
              {alarms.length > 0 && (
                <Text style={[styles.alarmsCount, { color: colors.textMuted }]}>
                  {alarms.filter(a => a.enabled).length}/{alarms.length}
                </Text>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <Pressable
            onPress={() => router.push('/alarm/new')}
            style={[styles.emptyCard, { borderColor: colors.border }]}
          >
            <Ionicons name="add-circle-outline" size={28} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('home.add_first_alarm')}
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onToggle={handleToggle}
            onPress={(a) => router.push(`/alarm/${a.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Verse hero
  verseSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    minHeight: 180,
    justifyContent: 'center',
  },
  verseText: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 36,
    letterSpacing: -0.3,
    fontStyle: 'italic',
  },
  verseRef: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: Spacing.lg,
  },
  versePlaceholder: {
    fontSize: FontSize.lg,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  // Separator
  separator: {
    height: 0.33,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  // Alarms
  alarmsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  alarmsTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
  },
  alarmsCount: {
    fontSize: FontSize.sm,
  },
  // Empty
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: FontSize.md,
  },
});
