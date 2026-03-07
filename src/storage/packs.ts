import AsyncStorage from '@react-native-async-storage/async-storage';
import { VersePack } from '../types';
import { BUILTIN_PACKS } from '../data/builtin-packs';

const CUSTOM_PACKS_KEY = 'prayer_room_custom_packs';
const DOWNLOADED_PACKS_KEY = 'prayer_room_downloaded_packs';

export async function getAllPacks(): Promise<VersePack[]> {
  const [customData, downloadedData] = await Promise.all([
    AsyncStorage.getItem(CUSTOM_PACKS_KEY),
    AsyncStorage.getItem(DOWNLOADED_PACKS_KEY),
  ]);
  const custom: VersePack[] = customData ? JSON.parse(customData) : [];
  const downloaded: VersePack[] = downloadedData ? JSON.parse(downloadedData) : [];
  return [...BUILTIN_PACKS, ...downloaded, ...custom];
}

export async function saveCustomPack(pack: VersePack): Promise<void> {
  const data = await AsyncStorage.getItem(CUSTOM_PACKS_KEY);
  const packs: VersePack[] = data ? JSON.parse(data) : [];
  const index = packs.findIndex((p) => p.id === pack.id);
  if (index >= 0) {
    packs[index] = pack;
  } else {
    packs.push(pack);
  }
  await AsyncStorage.setItem(CUSTOM_PACKS_KEY, JSON.stringify(packs));
}

export async function deleteCustomPack(id: string): Promise<void> {
  const data = await AsyncStorage.getItem(CUSTOM_PACKS_KEY);
  const packs: VersePack[] = data ? JSON.parse(data) : [];
  await AsyncStorage.setItem(
    CUSTOM_PACKS_KEY,
    JSON.stringify(packs.filter((p) => p.id !== id))
  );
}

export async function saveDownloadedPack(pack: VersePack): Promise<void> {
  const data = await AsyncStorage.getItem(DOWNLOADED_PACKS_KEY);
  const packs: VersePack[] = data ? JSON.parse(data) : [];
  packs.push({ ...pack, isDownloaded: true });
  await AsyncStorage.setItem(DOWNLOADED_PACKS_KEY, JSON.stringify(packs));
}
