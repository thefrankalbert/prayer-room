import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../contexts/ThemeContext';
import { AudioSource } from '../types';
import { NATIVE_SOUNDS, BUILTIN_TRACKS } from '../data/builtin-audio';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

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
            backgroundColor: selected ? colors.primary : colors.card,
            borderColor: selected ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.itemName,
            { color: selected ? colors.background : colors.text },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: selected ? colors.background : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: selected ? colors.primary : colors.textSecondary },
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
      <Text style={[styles.label, { color: colors.text }]}>Son</Text>

      {value.type === 'custom' && (
        <View
          style={[
            styles.customSelected,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.itemName, { color: colors.background }]} numberOfLines={1}>
            {value.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.background }]}>
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
        style={[styles.importButton, { borderColor: colors.primary }]}
      >
        <Text style={[styles.importText, { color: colors.primary }]}>
          Importer un audio
        </Text>
      </Pressable>
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
  list: { gap: Spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  customSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  importButton: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  importText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
