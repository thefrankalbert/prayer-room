import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Prayer Room</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your personal prayer companion
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 40, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 8 },
});
