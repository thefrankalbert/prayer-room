import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { VersePack } from '../types';
import { getAllPacks } from '../storage/packs';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

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
      <Text style={[styles.label, { color: colors.text }]}>Versets</Text>
      {packs.map((pack) => {
        const selected = value === pack.id;
        return (
          <Pressable
            key={pack.id}
            onPress={() => onChange(pack.id)}
            style={[
              styles.item,
              {
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemName,
                  { color: selected ? colors.background : colors.text },
                ]}
              >
                {pack.name}
              </Text>
              <Text
                style={[
                  styles.itemCount,
                  { color: selected ? colors.background : colors.textSecondary },
                ]}
              >
                {pack.verses.length} versets
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.md, paddingHorizontal: Spacing.md },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  item: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: FontSize.sm,
  },
});
