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
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.md }]}>
      <Text style={[styles.header, { color: colors.text }]}>Prayer Room</Text>

      <VerseCard verse={currentVerse} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes alarmes</Text>
        <Pressable
          onPress={() => router.push('/alarm/new')}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.addButtonText, { color: colors.background }]}>+</Text>
        </Pressable>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucune alarme configuree.{'\n'}Appuyez sur + pour en creer une.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onToggle={handleToggle}
              onPress={(a) => router.push(`/alarm/${a.id}`)}
            />
          )}
        />
      )}

      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Pressable onPress={() => router.push('/packs')} style={styles.navItem}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Versets</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/alarm/new')} style={[styles.navMainButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.navMainText, { color: colors.background }]}>+</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings')} style={styles.navItem}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Reglages</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: FontSize.xxl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600' },
  addButton: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { fontSize: 24, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { textAlign: 'center', fontSize: FontSize.md, lineHeight: 24 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm },
  navText: { fontSize: FontSize.md, fontWeight: '500' },
  navMainButton: { width: 56, height: 56, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', marginTop: -28 },
  navMainText: { fontSize: 28, fontWeight: '700' },
});
