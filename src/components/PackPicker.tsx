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
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        {packs.map((pack, index) => {
          const selected = value === pack.id;
          const isLast = index === packs.length - 1;
          return (
            <View key={pack.id}>
              <Pressable
                onPress={() => onChange(pack.id)}
                style={styles.row}
              >
                <Text
                  style={[styles.itemName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {pack.name}
                </Text>
                <View style={styles.rowRight}>
                  <Text style={[styles.countText, { color: colors.textMuted }]}>
                    {pack.verses.length} versets
                  </Text>
                  {selected && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>
                      {'\u2713'}
                    </Text>
                  )}
                </View>
              </Pressable>
              {!isLast && (
                <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  separator: {
    height: 0.33,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontSize: FontSize.md,
    flex: 1,
  },
  countText: {
    fontSize: FontSize.sm,
  },
  checkmark: {
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
});
