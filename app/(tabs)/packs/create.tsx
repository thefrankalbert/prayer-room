import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useLanguage } from '../../../src/contexts/LanguageContext';
import { VersePack, Verse } from '../../../src/types';
import { getAllPacks, saveCustomPack } from '../../../src/storage/packs';
import { Spacing, FontSize, BorderRadius } from '../../../src/constants/theme';

export default function CreatePackScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [newReference, setNewReference] = useState('');
  const [newText, setNewText] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      getAllPacks().then((packs) => {
        const found = packs.find((p) => p.id === editId);
        if (found) {
          setName(found.name);
          setDescription(found.description);
          setVerses(found.verses);
          setExistingId(found.id);
        }
      });
    }
  }, [editId]);

  function handleAddVerse() {
    const ref = newReference.trim();
    const txt = newText.trim();
    if (!ref || !txt) {
      Alert.alert(t('common.required_fields'), t('common.required_fields'));
      return;
    }
    setVerses((prev) => [...prev, { reference: ref, text: txt }]);
    setNewReference('');
    setNewText('');
  }

  function handleRemoveVerse(index: number) {
    setVerses((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(t('common.required_fields'), t('common.name_required'));
      return;
    }

    const pack: VersePack = {
      id: existingId ?? `custom_${Date.now()}`,
      name: trimmedName,
      description: description.trim(),
      category: 'custom',
      verses,
      isBuiltin: false,
    };

    await saveCustomPack(pack);
    router.back();
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.lg, paddingBottom: Spacing.xxxl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {existingId ? t('packs.edit') : t('packs.new')}
      </Text>

      {/* Name & Description grouped */}
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('packs.name_label')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('packs.name_placeholder')}
            style={[styles.inputField, { color: colors.text }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.rowSeparator, { backgroundColor: colors.borderLight }]} />
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{t('packs.desc_label')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('packs.desc_placeholder')}
            multiline
            style={[styles.inputField, { color: colors.text }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* Add verse */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('packs.add_verse_section')}</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.inputRow}>
          <TextInput
            value={newReference}
            onChangeText={setNewReference}
            placeholder={t('packs.ref_placeholder')}
            style={[styles.inputField, { color: colors.text }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.rowSeparator, { backgroundColor: colors.borderLight }]} />
        <View style={styles.inputRow}>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            placeholder={t('packs.text_placeholder')}
            multiline
            style={[styles.inputField, styles.textArea, { color: colors.text }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={[styles.rowSeparator, { backgroundColor: colors.borderLight }]} />
        <Pressable onPress={handleAddVerse} style={styles.addRow}>
          <Text style={[styles.addRowText, { color: colors.primary }]}>{t('packs.add')}</Text>
        </Pressable>
      </View>

      {/* Added verses */}
      {verses.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            {t('packs.verses_section')} ({verses.length})
          </Text>
          <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            {verses.map((verse, index) => (
              <View key={index}>
                <View style={styles.verseRow}>
                  <View style={[styles.verseAccent, { backgroundColor: colors.primary }]} />
                  <View style={styles.verseContent}>
                    <Text style={[styles.verseRef, { color: colors.text }]}>{verse.reference}</Text>
                    <Text style={[styles.verseText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {verse.text}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleRemoveVerse(index)} style={styles.removeButton}>
                    <Text style={[styles.removeText, { color: colors.danger }]}>X</Text>
                  </Pressable>
                </View>
                {index < verses.length - 1 && (
                  <View style={[styles.rowSeparator, { backgroundColor: colors.borderLight }]} />
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Save */}
      <Pressable
        onPress={handleSave}
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.saveText}>
          {existingId ? t('packs.save_edit') : t('packs.save_new')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  groupCard: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 0.33,
    overflow: 'hidden',
  },
  inputRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  inputField: {
    fontSize: FontSize.md,
    padding: 0,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rowSeparator: {
    height: 0.33,
    marginLeft: Spacing.md,
  },
  addRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRowText: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingRight: Spacing.sm,
    minHeight: 44,
  },
  verseAccent: {
    width: 2,
    alignSelf: 'stretch',
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
    borderRadius: 1,
  },
  verseContent: {
    flex: 1,
  },
  verseRef: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  verseText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  removeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#000000',
  },
});
