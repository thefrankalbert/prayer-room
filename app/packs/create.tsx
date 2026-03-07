import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { VersePack, Verse } from '../../src/types';
import { getAllPacks, saveCustomPack } from '../../src/storage/packs';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

export default function CreatePackScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      Alert.alert('Champs requis', 'Veuillez remplir la reference et le texte du verset.');
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
      Alert.alert('Nom requis', 'Veuillez donner un nom au pack.');
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
      contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: Spacing.xxxl }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {existingId ? 'Modifier le pack' : 'Nouveau pack'}
      </Text>

      {/* Form fields card */}
      <View style={[styles.formCard, Shadow.sm, { backgroundColor: colors.card }]}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Nom</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Mes versets preferes"
            style={[styles.input, { color: colors.text, backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={[styles.fieldSeparator, { backgroundColor: colors.borderLight }]} />

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Une courte description du pack"
            multiline
            style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* Verse entry section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ajouter un verset</Text>
      </View>

      <View style={[styles.verseEntryCard, Shadow.sm, { backgroundColor: colors.card }]}>
        <TextInput
          value={newReference}
          onChangeText={setNewReference}
          placeholder="Reference (ex: Jean 3:16)"
          style={[styles.input, { color: colors.text, backgroundColor: colors.cardElevated, borderColor: colors.borderLight }]}
          placeholderTextColor={colors.textMuted}
        />
        <TextInput
          value={newText}
          onChangeText={setNewText}
          placeholder="Texte du verset"
          multiline
          style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.cardElevated, borderColor: colors.borderLight, marginTop: Spacing.sm }]}
          placeholderTextColor={colors.textMuted}
        />
        <Pressable
          onPress={handleAddVerse}
          style={[styles.addButton, { backgroundColor: colors.accentSoft, borderColor: colors.primary }]}
        >
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Ajouter</Text>
        </Pressable>
      </View>

      {/* Added verses */}
      {verses.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Versets ({verses.length})
            </Text>
          </View>

          <View style={styles.verseList}>
            {verses.map((verse, index) => (
              <View
                key={index}
                style={[styles.miniVerseCard, Shadow.sm, { backgroundColor: colors.card }]}
              >
                <View style={[styles.miniVerseGold, { backgroundColor: colors.primary }]} />
                <View style={styles.miniVerseBody}>
                  <Text style={[styles.miniVerseRef, { color: colors.primary }]}>{verse.reference}</Text>
                  <Text style={[styles.miniVerseText, { color: colors.text }]} numberOfLines={2}>
                    {verse.text}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemoveVerse(index)} style={styles.removeButton}>
                  <View style={[styles.removeCircle, { backgroundColor: colors.accentSoft }]}>
                    <Text style={{ color: colors.danger, fontSize: 14, fontWeight: '700' }}>X</Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Save button */}
      <Pressable
        onPress={handleSave}
        style={[styles.saveButton, Shadow.gold, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.saveText, { color: colors.background }]}>
          {existingId ? 'Enregistrer' : 'Creer le pack'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.xs,
  },
  fieldSeparator: {
    height: 1,
    marginVertical: Spacing.sm,
    opacity: 0.5,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: FontSize.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  verseEntryCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  addButton: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  verseList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  miniVerseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  miniVerseGold: {
    width: 3,
    alignSelf: 'stretch',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  miniVerseBody: {
    flex: 1,
    padding: Spacing.md,
  },
  miniVerseRef: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  miniVerseText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  removeButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  removeCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  saveText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
