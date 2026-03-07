import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Alarm } from '../types';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

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
      style={[
        styles.container,
        {
          backgroundColor: alarm.enabled ? colors.card : colors.surface,
          borderColor: alarm.enabled ? colors.borderLight : colors.border,
        },
        alarm.enabled && Shadow.sm,
      ]}
    >
      <View style={[styles.indicator, { backgroundColor: alarm.enabled ? colors.primary : colors.textMuted }]} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: alarm.enabled ? colors.text : colors.textSecondary }]}>
          {alarm.name}
        </Text>
        <View style={styles.detailRow}>
          <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {formatInterval(alarm.intervalMinutes)}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {alarm.startTime} — {alarm.endTime}
          </Text>
        </View>
      </View>
      <Switch
        value={alarm.enabled}
        onValueChange={(val) => onToggle(alarm.id, val)}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={alarm.enabled ? '#fff' : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingLeft: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
  },
  indicator: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  content: { flex: 1, marginRight: Spacing.md },
  name: { fontSize: FontSize.lg, fontWeight: '600', marginBottom: Spacing.xs },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  timeText: { fontSize: FontSize.sm },
});
