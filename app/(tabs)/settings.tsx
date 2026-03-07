import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import {
  TIP_PRODUCTS,
  initIAP,
  fetchTipProducts,
  purchaseTip,
  endIAP,
} from '../../src/services/purchases';

export default function SettingsScreen() {
  const { mode, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [iapReady, setIapReady] = useState(false);
  const [tips, setTips] = useState(TIP_PRODUCTS);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const ok = await initIAP();
      if (!mounted) return;
      setIapReady(ok);
      const products = await fetchTipProducts();
      if (mounted) setTips(products);
    })();

    return () => {
      mounted = false;
      endIAP();
    };
  }, []);

  const handleTip = useCallback(
    async (productId: string, label: string) => {
      if (!iapReady) {
        Alert.alert(label, 'Les achats integres ne sont pas encore disponibles. Merci pour votre generosite !');
        return;
      }
      setPurchasing(productId);
      const success = await purchaseTip(productId);
      setPurchasing(null);
      if (success) {
        Alert.alert('Merci !', 'Votre soutien est une vraie benediction. Que Dieu vous benisse !');
      }
    },
    [iapReady],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.header, { color: colors.text }]}>Reglages</Text>

      {/* Appearance */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPARENCE</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Theme</Text>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {mode === 'dark' ? 'Sombre' : 'Clair'}
            </Text>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Focus Mode */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODE FOCUS</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Pressable
          onPress={() => Linking.openSettings()}
          style={styles.row}
        >
          <View style={styles.rowTextBlock}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Configurer le Focus</Text>
            <Text style={[styles.rowSubtext, { color: colors.textSecondary }]}>
              Bloquer les notifications pendant la priere
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Tips */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SOUTIEN</Text>
      <View style={styles.tipsRow}>
        {tips.map((tip) => (
          <Pressable
            key={tip.id}
            onPress={() => handleTip(tip.id, `${tip.emoji} ${tip.label}`)}
            disabled={purchasing !== null}
            style={[
              styles.tipCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderLight,
              },
              purchasing === tip.id && { opacity: 0.5 },
            ]}
          >
            {purchasing === tip.id ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.tipLabel, { color: colors.text }]}>
                  {tip.label}
                </Text>
                <Text style={[styles.tipPrice, { color: colors.primary }]}>
                  {tip.price}
                </Text>
              </>
            )}
          </Pressable>
        ))}
      </View>

      {/* About */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>A PROPOS</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>1.0.0</Text>
        </View>
        <View style={[styles.rowSeparator, { backgroundColor: colors.borderLight }]} />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
            Fait avec amour pour la communaute
          </Text>
        </View>
      </View>

      <View style={{ height: insets.bottom + Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    fontSize: FontSize.title,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  groupCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowTextBlock: {
    flex: 1,
  },
  rowLabel: {
    fontSize: FontSize.md,
  },
  rowSubtext: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  rowValue: {
    fontSize: FontSize.md,
  },
  rowSeparator: {
    height: 0.33,
    marginLeft: Spacing.md,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  tipsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tipCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 80,
  },
  tipLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  tipPrice: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
