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
import { useTheme } from '../src/contexts/ThemeContext';
import { Spacing, FontSize, BorderRadius, Shadow } from '../src/constants/theme';
import {
  TIP_PRODUCTS,
  initIAP,
  fetchTipProducts,
  purchaseTip,
  endIAP,
} from '../src/services/purchases';

export default function SettingsScreen() {
  const { mode, colors, toggleTheme } = useTheme();
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

  const focusSteps = [
    { icon: '\u2699', text: 'Ouvrez les Reglages iOS' },
    { icon: '\u25C8', text: 'Allez dans Focus' },
    { icon: '\u271A', text: 'Creez un nouveau Focus "Priere"' },
    { icon: '\u2726', text: 'Configurez les apps et contacts autorises' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>Reglages</Text>
      <View style={[styles.headerRule, { backgroundColor: colors.primaryDim }]} />

      {/* Theme */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPARENCE</Text>
      <View style={[styles.card, { backgroundColor: colors.cardElevated }, Shadow.sm]}>
        <View style={styles.themeRow}>
          <View style={styles.themeInfo}>
            <Text style={[styles.themeIcon, { color: colors.primary }]}>
              {mode === 'dark' ? '\u263D' : '\u2600'}
            </Text>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Theme</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                Mode {mode === 'dark' ? 'sombre' : 'clair'}
              </Text>
            </View>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      {/* Mode Focus */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODE FOCUS</Text>
      <View style={[styles.card, { backgroundColor: colors.cardElevated }, Shadow.sm]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Mode Focus "Priere"
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Configurez un mode Focus pour bloquer les notifications pendant vos temps de priere.
        </Text>
        <View style={styles.stepsContainer}>
          {focusSteps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepIconContainer, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.stepIcon, { color: colors.primary }]}>{step.icon}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>{step.text}</Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => Linking.openSettings()}
          style={[styles.settingsButton, { backgroundColor: colors.primary }, Shadow.gold]}
        >
          <Text style={[styles.settingsButtonText, { color: colors.background }]}>
            Ouvrir les reglages
          </Text>
        </Pressable>
      </View>

      {/* Tip Jar */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SOUTIEN</Text>
      <View style={[styles.card, { backgroundColor: colors.cardElevated }, Shadow.sm]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Soutenir le developpement
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Prayer Room est gratuit. Si l'application vous aide dans votre vie de priere, vous pouvez soutenir son developpement.
        </Text>
        <View style={styles.tipsRow}>
          {tips.map((tip, index) => (
            <Pressable
              key={tip.id}
              onPress={() => handleTip(tip.id, `${tip.emoji} ${tip.label}`)}
              disabled={purchasing !== null}
              style={[
                styles.tipCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: index === 1 ? colors.primary : colors.border,
                  borderWidth: index === 1 ? 1.5 : 1,
                },
                index === 1 && Shadow.gold,
                purchasing === tip.id && { opacity: 0.6 },
              ]}
            >
              {purchasing === tip.id ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginBottom: Spacing.xs }}
                />
              ) : (
                <>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={[styles.tipLabel, { color: colors.text }]}>
                    {tip.label}
                  </Text>
                </>
              )}
              <View style={[styles.tipPriceBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.tipPrice, { color: colors.primary }]}>
                  {tip.price}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* About */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>A PROPOS</Text>
      <View style={[styles.card, styles.aboutCard, { backgroundColor: colors.cardElevated }, Shadow.sm]}>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>Version</Text>
          <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>1.0.0</Text>
        </View>
        <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
        <Text style={[styles.aboutTagline, { color: colors.textMuted }]}>
          Fait avec amour pour la communaute
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.xxl + Spacing.md,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    fontSize: FontSize.title,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: Spacing.sm,
  },
  headerRule: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  themeIcon: {
    fontSize: 24,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  stepsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 16,
  },
  stepText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
  settingsButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  tipCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tipEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  tipLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  tipPriceBadge: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tipPrice: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  aboutCard: {
    paddingVertical: Spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  aboutLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aboutValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  aboutDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  aboutTagline: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: Spacing.xs,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
