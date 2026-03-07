import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../contexts/ThemeContext';
import { AudioSource } from '../types';
import { NATIVE_SOUNDS, BUILTIN_TRACKS } from '../data/builtin-audio';
import { Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

interface AudioPickerProps {
  value: AudioSource;
  onChange: (source: AudioSource) => void;
}

function getAudioKey(source: AudioSource): string {
  switch (source.type) {
    case 'native':
      return `native-${source.soundId}`;
    case 'builtin':
      return `builtin-${source.trackId}`;
    case 'custom':
      return `custom-${source.uri}`;
  }
}

function isSelected(a: AudioSource, b: AudioSource): boolean {
  return getAudioKey(a) === getAudioKey(b);
}

function getTypeBadge(type: AudioSource['type']): string {
  switch (type) {
    case 'native':
      return 'Systeme';
    case 'builtin':
      return 'Musique';
    case 'custom':
      return 'Perso';
  }
}

export function AudioPicker({ value, onChange }: AudioPickerProps) {
  const { colors } = useTheme();

  const allSources: AudioSource[] = [...NATIVE_SOUNDS, ...BUILTIN_TRACKS];

  async function handleImportCustom() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const customSource: AudioSource = {
          type: 'custom',
          uri: asset.uri,
          name: asset.name || 'Audio personnalise',
        };
        onChange(customSource);
      }
    } catch {
      // User cancelled or error
    }
  }

  const renderItem = ({ item }: { item: AudioSource }) => {
    const selected = isSelected(item, value);
    return (
      <Pressable
        onPress={() => onChange(item)}
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
        <Text
          style={[
            styles.itemName,
            { color: selected ? colors.text : colors.text },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.accentSoft,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: colors.primary },
            ]}
          >
            {getTypeBadge(item.type)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>SON</Text>

      {value.type === 'custom' && (
        <View
          style={[
            styles.customSelected,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.borderLight,
              borderLeftColor: colors.primary,
              borderLeftWidth: 3,
            },
            Shadow.sm,
          ]}
        >
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
            {value.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Perso</Text>
          </View>
        </View>
      )}

      <FlatList
        data={allSources}
        renderItem={renderItem}
        keyExtractor={getAudioKey}
        horizontal={false}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />

      <Pressable
        onPress={handleImportCustom}
        style={[styles.importButton, { borderColor: colors.primaryDim }]}
      >
        <Text style={[styles.importText, { color: colors.primary }]}>
          Importer un audio
        </Text>
      </Pressable>
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
  list: { gap: Spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  customSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  importButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  importText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
