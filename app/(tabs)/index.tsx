import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Alarm, Verse } from '../../src/types';
import { getAlarms, saveAlarm } from '../../src/storage/alarms';
import { getAllPacks } from '../../src/storage/packs';
import { getNextVerse } from '../../src/storage/settings';
import { scheduleAlarm } from '../../src/services/notifications';
import { AlarmCard } from '../../src/components/AlarmCard';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

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
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top }]}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  Bienvenue dans votre
                </Text>
                <Text style={[styles.title, { color: colors.text }]}>
                  Prayer Room
                </Text>
              </View>
            </View>

            {/* Verse Hero Card */}
            {currentVerse ? (
              <View style={[styles.verseHero, Shadow.lg]}>
                <LinearGradient
                  colors={[colors.card, colors.cardElevated]}
                  style={styles.verseGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.verseAccent, { backgroundColor: colors.primary }]} />
                  <View style={styles.verseContent}>
                    <Ionicons name="book-outline" size={18} color={colors.primaryDim} style={{ marginBottom: 12 }} />
                    <Text style={[styles.verseText, { color: colors.text }]}>
                      {currentVerse.text}
                    </Text>
                    <View style={[styles.verseDivider, { backgroundColor: colors.accentSoft }]} />
                    <Text style={[styles.verseRef, { color: colors.primary }]}>
                      {currentVerse.reference}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              /* Empty verse — show inspirational message */
              <View style={[styles.verseHero, Shadow.md]}>
                <LinearGradient
                  colors={[colors.card, colors.cardElevated]}
                  style={styles.verseGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.verseAccent, { backgroundColor: colors.primary }]} />
                  <View style={styles.verseContent}>
                    <Ionicons name="sparkles" size={18} color={colors.primaryDim} style={{ marginBottom: 12 }} />
                    <Text style={[styles.verseText, { color: colors.textSecondary }]}>
                      Creez une alarme pour recevoir des versets bibliques qui nourriront votre priere.
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                onPress={() => router.push('/alarm/new')}
                style={[styles.quickAction, { backgroundColor: colors.primary }, Shadow.gold]}
              >
                <Ionicons name="add-circle" size={22} color={colors.background} />
                <Text style={[styles.quickActionText, { color: colors.background }]}>
                  Nouvelle alarme
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/packs')}
                style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }]}
              >
                <Ionicons name="library" size={22} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  Explorer les versets
                </Text>
              </Pressable>
            </View>

            {/* Alarms section */}
            {alarms.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Mes alarmes
                </Text>
                <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                  {alarms.length} {alarms.length > 1 ? 'alarmes' : 'alarme'}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyAlarms}>
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
              <Ionicons name="notifications-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aucune alarme
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Configurez des rappels de priere reguliers pour rester connecte a Dieu tout au long de la journee.
              </Text>
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  // Verse hero
  verseHero: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  verseGradient: {
    flexDirection: 'row',
  },
  verseAccent: {
    width: 4,
  },
  verseContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  verseDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  verseRef: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 13,
  },
  // Empty
  emptyAlarms: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
