import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
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

export function AudioPicker({ value, onChange }: AudioPickerProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

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
          name: asset.name || t('audio.custom'),
        };
        onChange(customSource);
      }
    } catch {
      // User cancelled or error
    }
  }

  const sources = value.type === 'custom'
    ? [value, ...allSources]
    : allSources;

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        {sources.map((item, index) => {
          const selected = isSelected(item, value);
          const isLast = index === sources.length - 1;
          return (
            <View key={getAudioKey(item)}>
              <Pressable
                onPress={() => onChange(item)}
                style={styles.row}
              >
                <Text
                  style={[styles.itemName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {t(item.name) !== item.name ? t(item.name) : item.name}
                </Text>
                {selected && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>
                    {'\u2713'}
                  </Text>
                )}
              </Pressable>
              {!isLast && (
                <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          );
        })}

        <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
        <Pressable onPress={handleImportCustom} style={styles.row}>
          <Text style={[styles.importText, { color: colors.primary }]}>
            {t('audio.import')}
          </Text>
        </Pressable>
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
  separator: {
    height: 0.33,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontSize: FontSize.md,
    flex: 1,
  },
  checkmark: {
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  importText: {
    fontSize: FontSize.md,
    fontWeight: '400',
  },
});
