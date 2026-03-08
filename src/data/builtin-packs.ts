import { VersePack } from '../types';
import verseTags from './verse-tags.json';

type Category = keyof typeof verseTags;

const CATEGORY_META: { id: Category; name_fr: string; name_en: string; desc_fr: string; desc_en: string; category: VersePack['category'] }[] = [
  { id: 'healing', name_fr: 'Guérison', name_en: 'Healing', desc_fr: 'Versets sur la guérison divine', desc_en: 'Verses on divine healing', category: 'healing' },
  { id: 'encouragement', name_fr: 'Encouragement', name_en: 'Encouragement', desc_fr: 'Versets pour le courage', desc_en: 'Verses for courage', category: 'encouragement' },
  { id: 'prosperity', name_fr: 'Prospérité', name_en: 'Prosperity', desc_fr: 'Versets sur la provision divine', desc_en: 'Verses on divine provision', category: 'prosperity' },
  { id: 'faith', name_fr: 'Foi', name_en: 'Faith', desc_fr: 'Versets sur la foi', desc_en: 'Verses on faith', category: 'faith' },
  { id: 'protection', name_fr: 'Protection', name_en: 'Protection', desc_fr: 'Versets sur la protection divine', desc_en: 'Verses on divine protection', category: 'protection' },
  { id: 'love', name_fr: 'Amour', name_en: 'Love', desc_fr: "Versets sur l'amour de Dieu", desc_en: "Verses on God's love", category: 'love' },
  { id: 'wisdom', name_fr: 'Sagesse', name_en: 'Wisdom', desc_fr: 'Versets sur la sagesse', desc_en: 'Verses on wisdom', category: 'wisdom' },
  { id: 'praise', name_fr: 'Louange', name_en: 'Praise', desc_fr: 'Versets de louange', desc_en: 'Verses of praise', category: 'praise' },
  { id: 'peace', name_fr: 'Paix', name_en: 'Peace', desc_fr: 'Versets sur la paix', desc_en: 'Verses on peace', category: 'peace' },
  { id: 'family', name_fr: 'Famille', name_en: 'Family', desc_fr: 'Versets sur la famille', desc_en: 'Verses on family', category: 'family' },
  { id: 'work', name_fr: 'Travail', name_en: 'Work', desc_fr: 'Versets sur le travail', desc_en: 'Verses on work', category: 'work' },
  { id: 'forgiveness', name_fr: 'Pardon', name_en: 'Forgiveness', desc_fr: 'Versets sur le pardon', desc_en: 'Verses on forgiveness', category: 'forgiveness' },
  { id: 'strength', name_fr: 'Force', name_en: 'Strength', desc_fr: 'Versets sur la force en Dieu', desc_en: 'Verses on strength in God', category: 'strength' },
  { id: 'joy', name_fr: 'Joie', name_en: 'Joy', desc_fr: 'Versets sur la joie', desc_en: 'Verses on joy', category: 'joy' },
];

/**
 * Generate builtin packs from verse-tags.
 * Verse text will be loaded from Bible data when available;
 * until then, references are used as placeholders.
 */
export function getBuiltinPacks(language: 'fr' | 'en'): VersePack[] {
  return CATEGORY_META.map((cat) => {
    const tags = verseTags[cat.id] || [];
    return {
      id: cat.id,
      name: language === 'fr' ? cat.name_fr : cat.name_en,
      description: language === 'fr' ? cat.desc_fr : cat.desc_en,
      category: cat.category as VersePack['category'],
      isBuiltin: true,
      verses: tags.map((tag) => ({
        reference: language === 'fr' ? tag.ref_fr : tag.ref_en,
        text: '', // Will be resolved from Bible data
      })),
    };
  });
}

// Keep backward compat — default French packs
export const BUILTIN_PACKS: VersePack[] = getBuiltinPacks('fr');
