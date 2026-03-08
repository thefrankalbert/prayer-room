import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { Alarm, AlarmTemplate, AudioSource } from '../../src/types';
import { getAlarms, saveAlarm, deleteAlarm } from '../../src/storage/alarms';
import { scheduleAlarm, cancelAlarm } from '../../src/services/notifications';
import { IntervalPicker } from '../../src/components/IntervalPicker';
import { TimePicker } from '../../src/components/TimePicker';
import { AudioPicker } from '../../src/components/AudioPicker';
import { PackPicker } from '../../src/components/PackPicker';
import { TemplatePicker } from '../../src/components/TemplatePicker';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function AlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isNew = id === 'new';

  const [name, setName] = useState(t('alarm.name_default'));
  const [interval, setInterval] = useState(60);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('22:00');
  const [audio, setAudio] = useState<AudioSource>({ type: 'native', soundId: 'default', name: 'audio.default' });
  const [packId, setPackId] = useState('healing');
  const [template, setTemplate] = useState<AlarmTemplate>('standard');
  const [originalCreatedAt, setOriginalCreatedAt] = useState<string | null>(null);

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
          setTemplate(alarm.template || 'standard');
          setOriginalCreatedAt(alarm.createdAt);
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
      createdAt: isNew ? new Date().toISOString() : (originalCreatedAt || new Date().toISOString()),
      template,
    };
    await saveAlarm(alarm);
    await scheduleAlarm(alarm);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  async function handleDelete() {
    Alert.alert(t('alarm.delete'), t('alarm.delete_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await cancelAlarm(id!);
          await deleteAlarm(id!);
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>
        {isNew ? t('alarm.new_title') : t('alarm.edit_title')}
      </Text>

      {/* Name input - simple underline style */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('alarm.name_section')}</Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.nameInput, { color: colors.text }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* Interval */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('alarm.interval_section')}</Text>
        <IntervalPicker value={interval} onChange={setInterval} />
      </View>

      {/* Time */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('alarm.time_section')}</Text>
        <View style={styles.timeRow}>
          <TimePicker label={t('alarm.time_start')} value={startTime} onChange={setStartTime} />
          <Text style={[styles.timeSep, { color: colors.textMuted }]}>a</Text>
          <TimePicker label={t('alarm.time_end')} value={endTime} onChange={setEndTime} />
        </View>
      </View>

      {/* Audio */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('alarm.audio_section')}</Text>
        <AudioPicker value={audio} onChange={setAudio} />
      </View>

      {/* Pack */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('alarm.packs_section')}</Text>
        <PackPicker value={packId} onChange={setPackId} />
      </View>

      {/* Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{t('alarm.style_section')}</Text>
        <TemplatePicker value={template} onChange={setTemplate} />
      </View>

      {/* Save */}
      <Pressable
        onPress={handleSave}
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.saveText}>
          {isNew ? t('alarm.save_new') : t('alarm.save_edit')}
        </Text>
      </Pressable>

      {/* Delete */}
      {!isNew && (
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={[styles.deleteText, { color: colors.danger }]}>
            {t('alarm.delete')}
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
    fontSize: FontSize.title,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  groupCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    overflow: 'hidden',
  },
  nameInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    fontSize: FontSize.md,
    minHeight: 44,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  timeSep: {
    fontSize: FontSize.lg,
    fontWeight: '300',
    color: '#8E8E93',
  },
  saveButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
  deleteButton: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
});
