import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Alarm } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onPress: (alarm: Alarm) => void;
}

export function AlarmCard({ alarm, onToggle, onPress }: Props) {
  const { colors } = useTheme();

  const formatInterval = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  };

  return (
    <Pressable
      onPress={() => onPress(alarm)}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.left}>
        <Text style={[styles.name, { color: colors.text }]}>{alarm.name}</Text>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          Toutes les {formatInterval(alarm.intervalMinutes)} | {alarm.startTime} - {alarm.endTime}
        </Text>
      </View>
      <Switch
        value={alarm.enabled}
        onValueChange={(val) => onToggle(alarm.id, val)}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  left: { flex: 1, marginRight: Spacing.md },
  name: { fontSize: FontSize.lg, fontWeight: '600' },
  detail: { fontSize: FontSize.sm, marginTop: Spacing.xs },
});
