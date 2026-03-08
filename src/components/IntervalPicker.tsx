import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

const PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '40 min', minutes: 40 },
  { label: '1h', minutes: 60 },
  { label: '1h30', minutes: 90 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
];

interface IntervalPickerProps {
  value: number;
  onChange: (minutes: number) => void;
}

function formatCustomInterval(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

export function IntervalPicker({ value, onChange }: IntervalPickerProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [tempHours, setTempHours] = useState(Math.floor(value / 60));
  const [tempMinutes, setTempMinutes] = useState(value % 60);

  const isPreset = PRESETS.some((p) => p.minutes === value);
  const customLabel = isPreset ? t('alarm.interval_other') : formatCustomInterval(value);

  function handleConfirm() {
    const total = tempHours * 60 + tempMinutes;
    onChange(Math.max(5, total));
    setShowModal(false);
  }

  function handleOpenCustom() {
    setTempHours(Math.floor(value / 60));
    setTempMinutes(value % 60);
    setShowModal(true);
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {PRESETS.map((preset) => {
          const selected = value === preset.minutes;
          return (
            <Pressable
              key={preset.minutes}
              onPress={() => onChange(preset.minutes)}
              style={[styles.pill, {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.borderLight,
              }]}
            >
              <Text style={[styles.pillText, { color: selected ? '#000000' : colors.text }]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={handleOpenCustom}
          style={[styles.pill, {
            backgroundColor: !isPreset ? colors.primary : colors.card,
            borderColor: !isPreset ? colors.primary : colors.borderLight,
          }]}
        >
          <Text style={[styles.pillText, { color: !isPreset ? '#000000' : colors.text }]}>
            {customLabel}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('alarm.interval_custom_title')}</Text>
            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>h</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 13 }, (_, i) => i).map((h) => (
                    <Pressable key={h} onPress={() => setTempHours(h)} style={[styles.pickerItem, tempHours === h && { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.pickerItemText, { color: tempHours === h ? colors.primary : colors.text }]}>{h}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.pickerCol}>
                <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>min</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                    <Pressable key={m} onPress={() => setTempMinutes(m)} style={[styles.pickerItem, tempMinutes === m && { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.pickerItemText, { color: tempMinutes === m ? colors.primary : colors.text }]}>{m.toString().padStart(2, '0')}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
            <Pressable onPress={handleConfirm} style={[styles.confirmButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.confirmText}>{t('alarm.interval_validate')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  scrollContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  pill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full, borderWidth: 0.33 },
  pillText: { fontSize: FontSize.sm, fontWeight: '500' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.lg },
  pickerRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xxl },
  pickerCol: { alignItems: 'center', width: 80 },
  pickerLabel: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.sm },
  pickerScroll: { maxHeight: 200 },
  pickerItem: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.sm, marginVertical: 2 },
  pickerItemText: { fontSize: FontSize.xl, fontWeight: '500', textAlign: 'center' },
  confirmButton: { marginTop: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  confirmText: { fontSize: FontSize.md, fontWeight: '600', color: '#000000' },
});
