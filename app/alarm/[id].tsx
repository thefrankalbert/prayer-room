import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Alarm, AudioSource } from '../../src/types';
import { getAlarms, saveAlarm, deleteAlarm } from '../../src/storage/alarms';
import { scheduleAlarm, cancelAlarm } from '../../src/services/notifications';
import { IntervalPicker } from '../../src/components/IntervalPicker';
import { TimePicker } from '../../src/components/TimePicker';
import { AudioPicker } from '../../src/components/AudioPicker';
import { PackPicker } from '../../src/components/PackPicker';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function AlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const isNew = id === 'new';

  const [name, setName] = useState('Ma priere');
  const [interval, setInterval] = useState(60);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('22:00');
  const [audio, setAudio] = useState<AudioSource>({ type: 'native', soundId: 'default', name: 'Son par defaut' });
  const [packId, setPackId] = useState('healing');

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {isNew ? 'Nouvelle alarme' : "Modifier l'alarme"}
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <IntervalPicker value={interval} onChange={setInterval} />

      <View style={styles.timeRow}>
        <TimePicker label="Debut" value={startTime} onChange={setStartTime} />
        <Text style={[styles.timeSep, { color: colors.textSecondary }]}>a</Text>
        <TimePicker label="Fin" value={endTime} onChange={setEndTime} />
      </View>

      <AudioPicker value={audio} onChange={setAudio} />
      <PackPicker value={packId} onChange={setPackId} />

      <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.saveText, { color: colors.background }]}>
          {isNew ? "Creer l'alarme" : 'Enregistrer'}
        </Text>
      </Pressable>

      {!isNew && (
        <Pressable onPress={handleDelete} style={[styles.deleteButton, { borderColor: colors.danger }]}>
          <Text style={{ color: colors.danger, fontSize: FontSize.md, fontWeight: '600' }}>
            Supprimer l'alarme
          </Text>
        </Pressable>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  field: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.xs },
  input: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: FontSize.md },
  timeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, marginVertical: Spacing.md },
  timeSep: { fontSize: FontSize.lg },
  saveButton: { margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  saveText: { fontSize: FontSize.lg, fontWeight: '700' },
  deleteButton: { margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 2 },
});
