import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { VersePack } from '../types';
import { getAllPacks } from '../storage/packs';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

interface PackPickerProps {
  value: string; // packId
  onChange: (packId: string) => void;
}

export function PackPicker({ value, onChange }: PackPickerProps) {
  const { colors } = useTheme();
  const [packs, setPacks] = useState<VersePack[]>([]);

  useEffect(() => {
    getAllPacks().then(setPacks);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>VERSETS</Text>
      {packs.map((pack) => {
        const selected = value === pack.id;
        return (
          <Pressable
            key={pack.id}
            onPress={() => onChange(pack.id)}
            style={[
              styles.item,
              {
                backgroundColor: selected ? colors.cardElevated : colors.card,
                borderColor: selected ? colors.borderLight : colors.borderLight,
              },
              selected && {
                borderLeftColor: colors.primary,
                borderLeftWidth: 3,
              },
              selected && Shadow.sm,
            ]}
          >
            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemName,
                  { color: colors.text },
                ]}
              >
                {pack.name}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: selected ? colors.accentSoft : colors.accentSoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: colors.primary },
                  ]}
                >
                  {pack.verses.length} versets
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.lg, paddingHorizontal: Spacing.md },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  item: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
