import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '../../src/contexts/ThemeContext';
import { VersePack, Verse } from '../../src/types';
import { getAllPacks, saveCustomPack } from '../../src/storage/packs';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function CreatePackScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {existingId ? 'Modifier le pack' : 'Nouveau pack'}
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Mes versets preferes"
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Une courte description du pack"
          multiline
          style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Versets</Text>

        <View style={styles.field}>
          <TextInput
            value={newReference}
            onChangeText={setNewReference}
            placeholder="Reference (ex: Jean 3:16)"
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            placeholder="Texte du verset"
            multiline
            style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <Pressable
          onPress={handleAddVerse}
          style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 }]}
        >
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Ajouter</Text>
        </Pressable>
      </View>

      {verses.length > 0 && (
        <View style={styles.verseList}>
          {verses.map((verse, index) => (
            <View
              key={index}
              style={[styles.verseItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.verseContent}>
                <Text style={[styles.verseRef, { color: colors.primary }]}>{verse.reference}</Text>
                <Text style={[styles.verseText, { color: colors.text }]} numberOfLines={2}>
                  {verse.text}
                </Text>
              </View>
              <Pressable onPress={() => handleRemoveVerse(index)} style={styles.removeButton}>
                <Text style={{ color: colors.danger, fontSize: 18, fontWeight: '700' }}>X</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.saveText, { color: colors.background }]}>
          {existingId ? 'Enregistrer' : 'Creer le pack'}
        </Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  field: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.xs },
  input: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: FontSize.md },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  section: { marginTop: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  addButton: {
    marginHorizontal: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addButtonText: { fontSize: FontSize.md, fontWeight: '600' },
  verseList: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  verseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  verseContent: { flex: 1 },
  verseRef: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  verseText: { fontSize: FontSize.sm, fontStyle: 'italic', lineHeight: 20 },
  removeButton: { padding: Spacing.sm, marginLeft: Spacing.sm },
  saveButton: { margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.lg },
  saveText: { fontSize: FontSize.lg, fontWeight: '700' },
});
