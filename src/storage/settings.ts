import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../types';

const SETTINGS_KEY = 'prayer_room_settings';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  lastVerseIndex: {},
};

export async function getSettings(): Promise<Settings> {
  const data = await AsyncStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export async function updateSettings(partial: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ ...current, ...partial })
  );
}

export async function getNextVerse(packId: string, verses: { reference: string; text: string }[]): Promise<{ reference: string; text: string }> {
  const settings = await getSettings();
  const lastIndex = settings.lastVerseIndex[packId] ?? -1;
  const nextIndex = (lastIndex + 1) % verses.length;
  await updateSettings({
    lastVerseIndex: { ...settings.lastVerseIndex, [packId]: nextIndex },
  });
  return verses[nextIndex];
}
