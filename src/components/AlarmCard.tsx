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
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  };

  return (
    <Pressable
      onPress={() => onPress(alarm)}
      style={[styles.container, { borderBottomColor: colors.border }]}
    >
      <View style={styles.left}>
        <Text style={[
          styles.interval,
          { color: alarm.enabled ? colors.text : colors.textMuted }
        ]}>
          {formatInterval(alarm.intervalMinutes)}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.name, { color: alarm.enabled ? colors.textSecondary : colors.textMuted }]}>
            {alarm.name}
          </Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}> · </Text>
          <Text style={[styles.time, { color: alarm.enabled ? colors.textSecondary : colors.textMuted }]}>
            {alarm.startTime}–{alarm.endTime}
          </Text>
        </View>
      </View>
      <Switch
        value={alarm.enabled}
        onValueChange={(val) => onToggle(alarm.id, val)}
        trackColor={{ true: colors.primary, false: colors.borderLight }}
        ios_backgroundColor={colors.borderLight}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.33,
  },
  left: { flex: 1, marginRight: Spacing.md },
  interval: {
    fontSize: 42,
    fontWeight: '200',
    letterSpacing: -1,
    lineHeight: 48,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  name: { fontSize: FontSize.sm },
  dot: { fontSize: FontSize.sm },
  time: { fontSize: FontSize.sm },
});
