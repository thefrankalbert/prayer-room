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
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import {
  TIP_PRODUCTS,
  initIAP,
  fetchProducts,
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
      const products = await fetchProducts();
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
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>Reglages</Text>

      {/* Theme */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Mode {mode === 'dark' ? 'sombre' : 'clair'}
          </Text>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      {/* Mode Focus "Priere" */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Mode Focus "Priere"
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Configurez un mode Focus 'Priere' dans les reglages iOS pour bloquer
          les notifications pendant vos temps de priere.
        </Text>
        <View style={styles.steps}>
          <Text style={[styles.step, { color: colors.text }]}>
            1. Ouvrez les Reglages iOS
          </Text>
          <Text style={[styles.step, { color: colors.text }]}>
            2. Allez dans Focus
          </Text>
          <Text style={[styles.step, { color: colors.text }]}>
            3. Creez un nouveau Focus 'Priere'
          </Text>
          <Text style={[styles.step, { color: colors.text }]}>
            4. Configurez les apps et contacts autorises
          </Text>
        </View>
        <Pressable
          onPress={() => Linking.openSettings()}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Ouvrir les reglages
          </Text>
        </Pressable>
      </View>

      {/* Don de soutien */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Soutenir le developpement
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Prayer Room est gratuit. Si l'application vous aide dans votre vie de
          priere, vous pouvez soutenir son developpement.
        </Text>
        <View style={styles.tipsRow}>
          {tips.map((tip) => (
            <Pressable
              key={tip.id}
              onPress={() => handleTip(tip.id, `${tip.emoji} ${tip.label}`)}
              disabled={purchasing !== null}
              style={[
                styles.tipButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
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
                <Text style={[styles.tipLabel, { color: colors.text }]}>
                  {tip.emoji} {tip.label}
                </Text>
              )}
              <Text style={[styles.tipPrice, { color: colors.primary }]}>
                {tip.price}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* A propos */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          A propos
        </Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          Prayer Room v1.0.0
        </Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          Fait avec amour pour la communaute
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  header: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: FontSize.md,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  steps: {
    marginBottom: Spacing.md,
  },
  step: {
    fontSize: FontSize.sm,
    lineHeight: 24,
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  tipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  tipButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  tipPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  aboutText: {
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
});
