import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Alarm, AudioSource } from '../../src/types';
import { getAlarms, saveAlarm, deleteAlarm } from '../../src/storage/alarms';
import { scheduleAlarm, cancelAlarm } from '../../src/services/notifications';
import { IntervalPicker } from '../../src/components/IntervalPicker';
import { TimePicker } from '../../src/components/TimePicker';
import { AudioPicker } from '../../src/components/AudioPicker';
import { PackPicker } from '../../src/components/PackPicker';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

export default function AlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isNew = id === 'new';

  const [name, setName] = useState('Ma priere');
  const [interval, setInterval] = useState(60);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('22:00');
  const [audio, setAudio] = useState<AudioSource>({ type: 'native', soundId: 'default', name: 'Son par defaut' });
  const [packId, setPackId] = useState('healing');
  const [nameFocused, setNameFocused] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      getAlarms().then((alarms) => {
        const alarm = alarms.find((a) => a.id === id);
        if (alarm) {
          setName(alarm.name);
          setInterval(alarm.intervalMinutes);
          setStartTime(alarm.startTime);
          setEndTime(alarm.endTime);
          setAudio(alarm.audio);
          setPackId(alarm.packId);
        }
      });
    }
  }, [id]);

  async function handleSave() {
    const alarm: Alarm = {
      id: isNew ? Date.now().toString() : id!,
      name,
      intervalMinutes: interval,
      startTime,
      endTime,
      audio,
      packId,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    await saveAlarm(alarm);
    await scheduleAlarm(alarm);
    router.back();
  }

  async function handleDelete() {
    Alert.alert('Supprimer', 'Supprimer cette alarme ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await cancelAlarm(id!);
          await deleteAlarm(id!);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.md }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {isNew ? 'Nouvelle alarme' : "Modifier l'alarme"}
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>NOM</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.cardElevated,
              borderColor: nameFocused ? colors.primary : colors.borderLight,
            },
            nameFocused && Shadow.gold,
          ]}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <IntervalPicker value={interval} onChange={setInterval} />

      <View style={styles.timeRow}>
        <TimePicker label="Debut" value={startTime} onChange={setStartTime} />
        <Text style={[styles.timeSep, { color: colors.textMuted }]}>a</Text>
        <TimePicker label="Fin" value={endTime} onChange={setEndTime} />
      </View>

      <AudioPicker value={audio} onChange={setAudio} />
      <PackPicker value={packId} onChange={setPackId} />

      <Pressable
        onPress={handleSave}
        style={[
          styles.saveButton,
          { backgroundColor: colors.primary },
          Shadow.gold,
        ]}
      >
        <Text style={[styles.saveText, { color: colors.background }]}>
          {isNew ? "Creer l'alarme" : 'Enregistrer'}
        </Text>
      </Pressable>

      {!isNew && (
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={[styles.deleteText, { color: colors.danger }]}>
            Supprimer l'alarme
          </Text>
        </Pressable>
      )}

      <View style={{ height: insets.bottom + Spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: Spacing.xl },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    fontFamily: 'Georgia',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.md,
  },
  field: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    fontSize: FontSize.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    marginVertical: Spacing.xl,
  },
  timeSep: {
    fontSize: FontSize.lg,
    fontWeight: '300',
    marginTop: Spacing.lg,
  },
  saveButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  saveText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
