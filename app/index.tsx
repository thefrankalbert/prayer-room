import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { Alarm, Verse } from '../src/types';
import { getAlarms, saveAlarm } from '../src/storage/alarms';
import { getAllPacks } from '../src/storage/packs';
import { getNextVerse } from '../src/storage/settings';
import { scheduleAlarm } from '../src/services/notifications';
import { AlarmCard } from '../src/components/AlarmCard';
import { VerseCard } from '../src/components/VerseCard';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
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
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Bienvenue dans votre</Text>
          <Text style={[styles.title, { color: colors.text }]}>Prayer Room</Text>
        </View>
        <Pressable
          onPress={() => router.push('/alarm/new')}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.addButtonText, { color: colors.background }]}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <VerseCard verse={currentVerse} />
            {alarms.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                MES ALARMES
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyIcon, { color: colors.primaryDim }]}>&#x1F54A;</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Commencez votre parcours
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Creez votre premiere alarme de priere{'\n'}pour rester connecte a Dieu.
            </Text>
            <Pressable
              onPress={() => router.push('/alarm/new')}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyButtonText, { color: colors.background }]}>
                Creer une alarme
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <AlarmCard
            alarm={item}
            onToggle={handleToggle}
            onPress={(a) => router.push(`/alarm/${a.id}`)}
          />
        )}
      />

      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + Spacing.xs }]}>
        <Pressable onPress={() => router.push('/packs')} style={styles.navItem}>
          <Text style={[styles.navIcon, { color: colors.textSecondary }]}>&#x1F4D6;</Text>
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Versets</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/alarm/new')}
          style={[styles.navMainButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.navMainText, { color: colors.background }]}>+</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings')} style={styles.navItem}>
          <Text style={[styles.navIcon, { color: colors.textSecondary }]}>&#x2699;</Text>
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Reglages</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 24, fontWeight: '600' },
  listContent: { paddingBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', fontFamily: 'Georgia', marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.lg },
  emptyButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  emptyButtonText: { fontSize: FontSize.md, fontWeight: '700' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xs },
  navIcon: { fontSize: 20, marginBottom: 2 },
  navLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  navMainButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
  },
  navMainText: { fontSize: 28, fontWeight: '600' },
});
