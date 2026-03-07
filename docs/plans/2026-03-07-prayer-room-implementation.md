# Prayer Room V1.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a beautiful iPhone prayer alarm app with recurring intervals, Bible verse packs, and customizable audio sources.

**Architecture:** Expo Router file-based navigation with 5 main screens. Local-first storage with AsyncStorage for alarms, preferences, and custom packs. Expo Notifications for scheduled recurring alarms. Expo AV for audio playback. JSON on CDN for downloadable packs.

**Tech Stack:** React Native, Expo SDK 52+, Expo Router, Expo Notifications, Expo AV, Expo Document Picker, AsyncStorage, react-native-iap, EAS Build + TestFlight.

---

### Task 1: Project Scaffolding

**Files:**
- Create: Expo project root with `app/`, `src/`, `assets/` directories
- Create: `app/_layout.tsx` (root layout)
- Create: `src/constants/theme.ts`
- Create: `src/constants/colors.ts`

**Step 1: Initialize Expo project**

Run:
```bash
cd "/Users/a.g.i.c/Documents/Prayer Room"
npx create-expo-app@latest . --template blank-typescript
```
Expected: Expo project initialized with TypeScript

**Step 2: Install core dependencies**

Run:
```bash
npx expo install expo-router expo-notifications expo-av expo-document-picker @react-native-async-storage/async-storage expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens react-native-gesture-handler
```

**Step 3: Configure Expo Router**

Update `package.json` to add `"main": "expo-router/entry"`.

Update `app.json` with:
```json
{
  "expo": {
    "name": "Prayer Room",
    "slug": "prayer-room",
    "scheme": "prayerroom",
    "version": "1.0.0",
    "platforms": ["ios"],
    "icon": "./assets/icon.png",
    "splash": { "backgroundColor": "#1a1a2e" },
    "ios": {
      "bundleIdentifier": "com.prayerroom.app",
      "supportsTablet": false
    },
    "plugins": ["expo-router", "expo-notifications", "expo-document-picker"]
  }
}
```

**Step 4: Create theme constants**

Create `src/constants/colors.ts`:
```typescript
export const Colors = {
  dark: {
    background: '#1a1a2e',
    surface: '#16213e',
    card: '#0f3460',
    primary: '#d4a574',
    primaryLight: '#e8c9a0',
    text: '#f5f5f5',
    textSecondary: '#a0a0b0',
    accent: '#d4a574',
    border: '#2a2a4a',
    danger: '#e74c3c',
    success: '#2ecc71',
  },
  light: {
    background: '#faf8f5',
    surface: '#ffffff',
    card: '#f0ebe3',
    primary: '#8b6914',
    primaryLight: '#c4a35a',
    text: '#2c2c2c',
    textSecondary: '#6b6b7b',
    accent: '#8b6914',
    border: '#e0dcd4',
    danger: '#e74c3c',
    success: '#2ecc71',
  },
};
```

Create `src/constants/theme.ts`:
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  title: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

**Step 5: Create root layout with theme provider**

Create `src/contexts/ThemeContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof Colors.dark;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem('theme', next);
  };

  return (
    <ThemeContext.Provider value={{ mode, colors: Colors[mode], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

Create `app/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';

function RootLayoutInner() {
  const { colors, mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
```

**Step 6: Create placeholder home screen**

Create `app/index.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Prayer Room</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your personal prayer companion
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 40, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 8 },
});
```

**Step 7: Verify app runs**

Run:
```bash
npx expo start --ios
```
Expected: App launches in iOS Simulator with "Prayer Room" title on dark background

**Step 8: Commit**

```bash
git init
echo "node_modules/\n.expo/\ndist/\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n*.orig.*\nweb-build/\n.env" > .gitignore
git add .
git commit -m "feat: scaffold Prayer Room Expo project with theme system"
```

---

### Task 2: Data Models & Storage Layer

**Files:**
- Create: `src/types/index.ts`
- Create: `src/storage/alarms.ts`
- Create: `src/storage/packs.ts`
- Create: `src/storage/settings.ts`

**Step 1: Define TypeScript types**

Create `src/types/index.ts`:
```typescript
export type AudioSource =
  | { type: 'native'; soundId: string; name: string }
  | { type: 'builtin'; trackId: string; name: string }
  | { type: 'custom'; uri: string; name: string };

export interface Alarm {
  id: string;
  name: string;
  intervalMinutes: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  audio: AudioSource;
  packId: string;
  enabled: boolean;
  createdAt: string;
}

export interface Verse {
  reference: string; // e.g. "Esaie 53:5"
  text: string;
}

export interface VersePack {
  id: string;
  name: string;
  description: string;
  category: 'healing' | 'encouragement' | 'prosperity' | 'faith' | 'protection' | 'custom';
  verses: Verse[];
  isBuiltin: boolean;
  isDownloaded?: boolean;
}

export interface Settings {
  theme: 'dark' | 'light';
  lastVerseIndex: Record<string, number>; // packId -> last shown index
}
```

**Step 2: Create alarm storage**

Create `src/storage/alarms.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types';

const ALARMS_KEY = 'prayer_room_alarms';

export async function getAlarms(): Promise<Alarm[]> {
  const data = await AsyncStorage.getItem(ALARMS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveAlarm(alarm: Alarm): Promise<void> {
  const alarms = await getAlarms();
  const index = alarms.findIndex((a) => a.id === alarm.id);
  if (index >= 0) {
    alarms[index] = alarm;
  } else {
    alarms.push(alarm);
  }
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export async function deleteAlarm(id: string): Promise<void> {
  const alarms = await getAlarms();
  await AsyncStorage.setItem(
    ALARMS_KEY,
    JSON.stringify(alarms.filter((a) => a.id !== id))
  );
}
```

**Step 3: Create packs storage**

Create `src/storage/packs.ts`:
```typescript
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
```

**Step 4: Create settings storage**

Create `src/storage/settings.ts`:
```typescript
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
```

**Step 5: Commit**

```bash
git add src/types src/storage
git commit -m "feat: add data models and AsyncStorage layer"
```

---

### Task 3: Built-in Bible Verse Packs

**Files:**
- Create: `src/data/builtin-packs.ts`

**Step 1: Create the 5 built-in packs**

Create `src/data/builtin-packs.ts` with 20 verses per pack. Each verse contains `reference` and `text` in French.

Packs to create:
1. `healing` - Guerison (Esaie 53:5, Psaume 103:3, Jeremie 30:17, 3 Jean 1:2, Exode 15:26, Psaume 107:20, Malachie 4:2, Matthieu 8:17, 1 Pierre 2:24, Psaume 30:3, Proverbes 4:20-22, Esaie 58:8, Psaume 147:3, Jacques 5:15, Actes 10:38, Marc 5:34, Luc 4:18, Deuteronome 7:15, Psaume 41:4, Esaie 40:29)
2. `encouragement` - Encouragement (Josue 1:9, Esaie 41:10, Philippiens 4:13, Romains 8:28, 2 Timothee 1:7, Psaume 27:1, Deuteronome 31:6, Esaie 43:2, Psaume 46:2, Romains 8:31, Psaume 56:4, Esaie 40:31, 2 Corinthiens 4:16-17, Psaume 34:18, Jean 16:33, Hebreux 13:6, Psaume 118:6, Nahum 1:7, Lamentations 3:22-23, Psaume 23:4)
3. `prosperity` - Prosperite (Malachie 3:10, Philippiens 4:19, Deuteronome 28:12, Psaume 1:3, 3 Jean 1:2, Proverbes 10:22, Josue 1:8, 2 Corinthiens 9:8, Deuteronome 8:18, Psaume 35:27, Proverbes 3:9-10, Luc 6:38, Psaume 23:1, Esaie 48:17, Genese 26:12, Proverbes 13:22, Psaume 112:3, Deuteronome 28:8, 2 Corinthiens 8:9, Psaume 84:12)
4. `faith` - Foi (Hebreux 11:1, Romains 10:17, Marc 11:24, Matthieu 17:20, 2 Corinthiens 5:7, Hebreux 11:6, Jacques 1:6, Romains 1:17, Galates 2:20, 1 Jean 5:4, Marc 9:23, Ephesiens 2:8, Matthieu 21:22, Romains 4:20-21, Habacuc 2:4, Hebreux 12:2, 1 Pierre 1:7, Luc 17:6, Romains 8:24-25, Psaume 37:5)
5. `protection` - Protection (Psaume 91:1-2, Psaume 121:7-8, Esaie 54:17, 2 Thessaloniciens 3:3, Psaume 46:2, Proverbes 18:10, Psaume 23:4, Psaume 34:8, Deuteronome 31:8, Nahum 1:7, Psaume 125:2, Esaie 43:2, Psaume 91:11, 2 Samuel 22:3-4, Psaume 18:3, Jean 10:28-29, Psaume 27:1, Psaume 32:7, Romains 8:38-39, Psaume 121:3-4)

Each verse object: `{ reference: "Esaie 53:5", text: "Mais il etait blesse pour nos peches..." }`

**Note:** Use full verse text in French (Louis Segond translation).

**Step 2: Commit**

```bash
git add src/data
git commit -m "feat: add 5 built-in Bible verse packs (100 verses)"
```

---

### Task 4: Built-in Audio Library

**Files:**
- Create: `src/data/builtin-audio.ts`
- Create: `src/services/audio.ts`
- Add: royalty-free worship audio files in `assets/audio/`

**Step 1: Create native sounds list**

Create `src/data/builtin-audio.ts`:
```typescript
import { AudioSource } from '../types';

export const NATIVE_SOUNDS: AudioSource[] = [
  { type: 'native', soundId: 'default', name: 'Son par defaut' },
  { type: 'native', soundId: 'tri-tone', name: 'Tri-tone' },
  { type: 'native', soundId: 'bell', name: 'Cloche' },
  { type: 'native', soundId: 'chime', name: 'Carillon' },
  { type: 'native', soundId: 'harp', name: 'Harpe' },
];

export const BUILTIN_TRACKS: AudioSource[] = [
  { type: 'builtin', trackId: 'worship-piano-1', name: 'Piano Worship 1' },
  { type: 'builtin', trackId: 'worship-piano-2', name: 'Piano Worship 2' },
  { type: 'builtin', trackId: 'gentle-worship', name: 'Louange Douce' },
  { type: 'builtin', trackId: 'prayer-ambient', name: 'Ambiance Priere' },
  { type: 'builtin', trackId: 'meditation-calm', name: 'Meditation Calme' },
];
```

**Step 2: Create audio service**

Create `src/services/audio.ts`:
```typescript
import { Audio } from 'expo-av';
import { AudioSource } from '../types';

let currentSound: Audio.Sound | null = null;

export async function playAudio(source: AudioSource): Promise<void> {
  await stopAudio();

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });

  let sound: Audio.Sound;

  switch (source.type) {
    case 'native':
      // Use Expo Notifications sound for native
      // Native sounds are handled by the notification system
      return;
    case 'builtin': {
      const audioFiles: Record<string, any> = {
        'worship-piano-1': require('../../assets/audio/worship-piano-1.mp3'),
        'worship-piano-2': require('../../assets/audio/worship-piano-2.mp3'),
        'gentle-worship': require('../../assets/audio/gentle-worship.mp3'),
        'prayer-ambient': require('../../assets/audio/prayer-ambient.mp3'),
        'meditation-calm': require('../../assets/audio/meditation-calm.mp3'),
      };
      const { sound: s } = await Audio.Sound.createAsync(audioFiles[source.trackId]);
      sound = s;
      break;
    }
    case 'custom': {
      const { sound: s } = await Audio.Sound.createAsync({ uri: source.uri });
      sound = s;
      break;
    }
  }

  currentSound = sound;
  await sound.playAsync();
}

export async function stopAudio(): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
}

export async function getAudioDuration(source: AudioSource): Promise<number> {
  if (source.type === 'native') return 30000; // 30s default for native sounds

  const { sound } = await Audio.Sound.createAsync(
    source.type === 'builtin'
      ? require(`../../assets/audio/${source.trackId}.mp3`)
      : { uri: source.uri }
  );
  const status = await sound.getStatusAsync();
  const duration = status.isLoaded ? status.durationMillis ?? 30000 : 30000;
  await sound.unloadAsync();
  return duration;
}
```

**Step 3: Add placeholder audio files**

Add 5 royalty-free worship/ambient MP3 files to `assets/audio/`. These should be short (1-3 min) ambient worship tracks. Source from free worship music sites or generate with AI.

**Step 4: Commit**

```bash
git add src/data/builtin-audio.ts src/services/audio.ts assets/audio/
git commit -m "feat: add audio service with native, builtin, and custom sources"
```

---

### Task 5: Notification/Alarm Service

**Files:**
- Create: `src/services/notifications.ts`

**Step 1: Create notification service**

Create `src/services/notifications.ts`:
```typescript
import * as Notifications from 'expo-notifications';
import { Alarm } from '../types';
import { getNextVerse } from '../storage/settings';
import { getAllPacks } from '../storage/packs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  // Cancel existing notifications for this alarm
  await cancelAlarm(alarm.id);

  if (!alarm.enabled) return;

  const packs = await getAllPacks();
  const pack = packs.find((p) => p.id === alarm.packId);
  if (!pack) return;

  // Parse start/end times
  const [startH, startM] = alarm.startTime.split(':').map(Number);
  const [endH, endM] = alarm.endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Schedule notifications at each interval within the time window
  const intervalMs = alarm.intervalMinutes;
  let currentMinute = startMinutes;
  let notifIndex = 0;

  while (currentMinute < endMinutes) {
    const hour = Math.floor(currentMinute / 60);
    const minute = currentMinute % 60;

    const verse = pack.verses[notifIndex % pack.verses.length];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Prayer Room - ${alarm.name}`,
        body: `${verse.reference}\n${verse.text}`,
        data: { alarmId: alarm.id, verseReference: verse.reference },
        sound: alarm.audio.type === 'native' ? true : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
      identifier: `${alarm.id}_${notifIndex}`,
    });

    currentMinute += intervalMs;
    notifIndex++;
  }
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier.startsWith(alarmId)) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function cancelAllAlarms(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
```

**Step 2: Commit**

```bash
git add src/services/notifications.ts
git commit -m "feat: add notification service for recurring prayer alarms"
```

---

### Task 6: Home Screen

**Files:**
- Modify: `app/index.tsx`
- Create: `src/components/AlarmCard.tsx`
- Create: `src/components/VerseCard.tsx`

**Step 1: Create VerseCard component**

Create `src/components/VerseCard.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Verse } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  verse: Verse | null;
}

export function VerseCard({ verse }: Props) {
  const { colors } = useTheme();
  if (!verse) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.reference, { color: colors.primary }]}>{verse.reference}</Text>
      <Text style={[styles.text, { color: colors.text }]}>{verse.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  reference: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
```

**Step 2: Create AlarmCard component**

Create `src/components/AlarmCard.tsx`:
```typescript
import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Alarm } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onPress: (alarm: Alarm) => void;
}

export function AlarmCard({ alarm, onToggle, onPress }: Props) {
  const { colors } = useTheme();

  const formatInterval = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  };

  return (
    <Pressable
      onPress={() => onPress(alarm)}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.left}>
        <Text style={[styles.name, { color: colors.text }]}>{alarm.name}</Text>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          Toutes les {formatInterval(alarm.intervalMinutes)} | {alarm.startTime} - {alarm.endTime}
        </Text>
      </View>
      <Switch
        value={alarm.enabled}
        onValueChange={(val) => onToggle(alarm.id, val)}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  left: { flex: 1, marginRight: Spacing.md },
  name: { fontSize: FontSize.lg, fontWeight: '600' },
  detail: { fontSize: FontSize.sm, marginTop: Spacing.xs },
});
```

**Step 3: Update Home Screen**

Update `app/index.tsx`:
```typescript
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { Alarm, Verse } from '../src/types';
import { getAlarms, saveAlarm } from '../src/storage/alarms';
import { getAllPacks } from '../src/storage/packs';
import { getNextVerse } from '../src/storage/settings';
import { scheduleAlarm } from '../src/services/notifications';
import { AlarmCard } from '../src/components/AlarmCard';
import { VerseCard } from '../src/components/VerseCard';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const loaded = await getAlarms();
    setAlarms(loaded);

    // Show a verse from the first active alarm's pack
    const activeAlarm = loaded.find((a) => a.enabled);
    if (activeAlarm) {
      const packs = await getAllPacks();
      const pack = packs.find((p) => p.id === activeAlarm.packId);
      if (pack) {
        const verse = await getNextVerse(pack.id, pack.verses);
        setCurrentVerse(verse);
      }
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;
    const updated = { ...alarm, enabled };
    await saveAlarm(updated);
    await scheduleAlarm(updated);
    setAlarms((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Prayer Room</Text>

      <VerseCard verse={currentVerse} />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes alarmes</Text>
        <Pressable
          onPress={() => router.push('/alarm/new')}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.addButtonText, { color: colors.background }]}>+</Text>
        </Pressable>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucune alarme configuree.{'\n'}Appuyez sur + pour en creer une.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmCard
              alarm={item}
              onToggle={handleToggle}
              onPress={(a) => router.push(`/alarm/${a.id}`)}
            />
          )}
        />
      )}

      <View style={styles.bottomNav}>
        <Pressable onPress={() => router.push('/packs')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Versets</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings')}>
          <Text style={[styles.navText, { color: colors.textSecondary }]}>Reglages</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl },
  header: { fontSize: FontSize.xxl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600' },
  addButton: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { fontSize: 24, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { textAlign: 'center', fontSize: FontSize.md, lineHeight: 24 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)' },
  navText: { fontSize: FontSize.md, fontWeight: '500' },
});
```

**Step 4: Commit**

```bash
git add app/index.tsx src/components/
git commit -m "feat: build home screen with alarm cards and verse display"
```

---

### Task 7: Create/Edit Alarm Screen

**Files:**
- Create: `app/alarm/[id].tsx`
- Create: `src/components/IntervalPicker.tsx`
- Create: `src/components/AudioPicker.tsx`
- Create: `src/components/PackPicker.tsx`
- Create: `src/components/TimePicker.tsx`

**Step 1: Create IntervalPicker**

Create `src/components/IntervalPicker.tsx`:
```typescript
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

const PRESETS = [
  { label: '30 min', value: 30 },
  { label: '40 min', value: 40 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];

interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export function IntervalPicker({ value, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Intervalle</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.value}
            onPress={() => onChange(preset.value)}
            style={[
              styles.chip,
              {
                backgroundColor: value === preset.value ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: value === preset.value ? colors.background : colors.text },
              ]}
            >
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.sm },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, marginHorizontal: Spacing.xs },
  chipText: { fontSize: FontSize.md, fontWeight: '500' },
});
```

**Step 2: Create TimePicker**

Create `src/components/TimePicker.tsx`:
```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { Spacing, FontSize } from '../constants/theme';

interface Props {
  label: string;
  value: string; // "HH:mm"
  onChange: (time: string) => void;
}

export function TimePicker({ label, value, onChange }: Props) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  const [h, m] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable onPress={() => setShow(true)}>
        <Text style={[styles.time, { color: colors.text }]}>{value}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour
          onChange={(_, d) => {
            setShow(false);
            if (d) {
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              onChange(`${hh}:${mm}`);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  label: { fontSize: FontSize.sm, marginBottom: Spacing.xs },
  time: { fontSize: FontSize.xl, fontWeight: '700' },
});
```

Note: Requires `npx expo install @react-native-community/datetimepicker`

**Step 3: Create AudioPicker**

Create `src/components/AudioPicker.tsx`:
```typescript
import { View, Text, Pressable, StyleSheet, FlatList, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../contexts/ThemeContext';
import { AudioSource } from '../types';
import { NATIVE_SOUNDS, BUILTIN_TRACKS } from '../data/builtin-audio';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  value: AudioSource;
  onChange: (source: AudioSource) => void;
}

export function AudioPicker({ value, onChange }: Props) {
  const { colors } = useTheme();

  const allSources: AudioSource[] = [...NATIVE_SOUNDS, ...BUILTIN_TRACKS];

  async function pickCustomFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onChange({ type: 'custom', uri: asset.uri, name: asset.name });
    }
  }

  const isSelected = (source: AudioSource) => {
    if (source.type === 'native' && value.type === 'native') return source.soundId === value.soundId;
    if (source.type === 'builtin' && value.type === 'builtin') return source.trackId === value.trackId;
    if (source.type === 'custom' && value.type === 'custom') return source.uri === value.uri;
    return false;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Son de l'alarme</Text>

      {allSources.map((source, i) => (
        <Pressable
          key={i}
          onPress={() => onChange(source)}
          style={[
            styles.item,
            {
              backgroundColor: isSelected(source) ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={{ color: isSelected(source) ? colors.background : colors.text, fontSize: FontSize.md }}>
            {source.name}
          </Text>
          <Text style={{ color: isSelected(source) ? colors.background : colors.textSecondary, fontSize: FontSize.sm }}>
            {source.type === 'native' ? 'Sonnerie' : source.type === 'builtin' ? 'Worship' : 'Perso'}
          </Text>
        </Pressable>
      ))}

      {value.type === 'custom' && (
        <View style={[styles.item, { backgroundColor: colors.primary, borderColor: colors.border }]}>
          <Text style={{ color: colors.background, fontSize: FontSize.md }}>{value.name}</Text>
          <Text style={{ color: colors.background, fontSize: FontSize.sm }}>Perso</Text>
        </View>
      )}

      <Pressable onPress={pickCustomFile} style={[styles.importButton, { borderColor: colors.primary }]}>
        <Text style={{ color: colors.primary, fontSize: FontSize.md, fontWeight: '600' }}>
          Importer un fichier audio
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.sm },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  importButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});
```

**Step 4: Create PackPicker**

Create `src/components/PackPicker.tsx`:
```typescript
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { VersePack } from '../types';
import { getAllPacks } from '../storage/packs';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  value: string;
  onChange: (packId: string) => void;
}

export function PackPicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  const [packs, setPacks] = useState<VersePack[]>([]);

  useEffect(() => {
    getAllPacks().then(setPacks);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Pack de versets</Text>
      {packs.map((pack) => (
        <Pressable
          key={pack.id}
          onPress={() => onChange(pack.id)}
          style={[
            styles.item,
            {
              backgroundColor: value === pack.id ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={{ color: value === pack.id ? colors.background : colors.text, fontSize: FontSize.md, fontWeight: '600' }}>
            {pack.name}
          </Text>
          <Text style={{ color: value === pack.id ? colors.background : colors.textSecondary, fontSize: FontSize.sm }}>
            {pack.verses.length} versets
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.sm },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
});
```

**Step 5: Create Alarm form screen**

Create `app/alarm/[id].tsx`:
```typescript
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Alarm, AudioSource } from '../../src/types';
import { getAlarms, saveAlarm, deleteAlarm } from '../../src/storage/alarms';
import { scheduleAlarm, cancelAlarm } from '../../src/services/notifications';
import { IntervalPicker } from '../../src/components/IntervalPicker';
import { TimePicker } from '../../src/components/TimePicker';
import { AudioPicker } from '../../src/components/AudioPicker';
import { PackPicker } from '../../src/components/PackPicker';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function AlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const isNew = id === 'new';

  const [name, setName] = useState('Ma priere');
  const [interval, setInterval] = useState(60);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('22:00');
  const [audio, setAudio] = useState<AudioSource>({ type: 'native', soundId: 'default', name: 'Son par defaut' });
  const [packId, setPackId] = useState('healing');

  useEffect(() => {
    if (!isNew) {
      getAlarms().then((alarms) => {
        const alarm = alarms.find((a) => a.id === id);
        if (alarm) {
          setName(alarm.name);
          setInterval(alarm.intervalMinutes);
          setStartTime(alarm.startTime);
          setEndTime(alarm.endTime);
          setAudio(alarm.audio);
          setPackId(alarm.packId);
        }
      });
    }
  }, [id]);

  async function handleSave() {
    const alarm: Alarm = {
      id: isNew ? Date.now().toString() : id!,
      name,
      intervalMinutes: interval,
      startTime,
      endTime,
      audio,
      packId,
      enabled: true,
      createdAt: isNew ? new Date().toISOString() : undefined!,
    };
    await saveAlarm(alarm);
    await scheduleAlarm(alarm);
    router.back();
  }

  async function handleDelete() {
    Alert.alert('Supprimer', 'Supprimer cette alarme ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await cancelAlarm(id!);
          await deleteAlarm(id!);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {isNew ? 'Nouvelle alarme' : 'Modifier l\'alarme'}
      </Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <IntervalPicker value={interval} onChange={setInterval} />

      <View style={styles.timeRow}>
        <TimePicker label="Debut" value={startTime} onChange={setStartTime} />
        <Text style={[styles.timeSep, { color: colors.textSecondary }]}>a</Text>
        <TimePicker label="Fin" value={endTime} onChange={setEndTime} />
      </View>

      <AudioPicker value={audio} onChange={setAudio} />
      <PackPicker value={packId} onChange={setPackId} />

      <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.saveText, { color: colors.background }]}>
          {isNew ? 'Creer l\'alarme' : 'Enregistrer'}
        </Text>
      </Pressable>

      {!isNew && (
        <Pressable onPress={handleDelete} style={[styles.deleteButton, { borderColor: colors.danger }]}>
          <Text style={{ color: colors.danger, fontSize: FontSize.md, fontWeight: '600' }}>
            Supprimer l'alarme
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl },
  title: { fontSize: FontSize.xl, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  field: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: '600', marginBottom: Spacing.xs },
  input: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, fontSize: FontSize.md },
  timeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, marginVertical: Spacing.md },
  timeSep: { fontSize: FontSize.lg },
  saveButton: { margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  saveText: { fontSize: FontSize.lg, fontWeight: '700' },
  deleteButton: { margin: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 2 },
});
```

**Step 6: Install DateTimePicker**

Run: `npx expo install @react-native-community/datetimepicker`

**Step 7: Commit**

```bash
git add app/alarm/ src/components/IntervalPicker.tsx src/components/TimePicker.tsx src/components/AudioPicker.tsx src/components/PackPicker.tsx
git commit -m "feat: add create/edit alarm screen with interval, audio, and pack pickers"
```

---

### Task 8: Verse Packs Screen

**Files:**
- Create: `app/packs/index.tsx`
- Create: `app/packs/[id].tsx`
- Create: `app/packs/create.tsx`

**Step 1: Create packs list screen**

Create `app/packs/index.tsx`: List all packs (builtin + downloaded + custom). Each item shows name, category, verse count. Button to create custom pack. Section for downloadable packs (fetched from CDN JSON).

**Step 2: Create pack detail screen**

Create `app/packs/[id].tsx`: Show all verses in a pack. FlatList of verse cards. If custom pack, allow editing (add/remove verses).

**Step 3: Create custom pack creation screen**

Create `app/packs/create.tsx`: Form with pack name, description. Add verses one by one (reference + text fields). Save to AsyncStorage via `saveCustomPack()`.

**Step 4: Commit**

```bash
git add app/packs/
git commit -m "feat: add verse packs screens (list, detail, create custom)"
```

---

### Task 9: Settings Screen

**Files:**
- Create: `app/settings.tsx`

**Step 1: Create settings screen**

Create `app/settings.tsx` with:
- Theme toggle (dark/light) using `useTheme().toggleTheme()`
- Focus "Priere" section: explanatory text + button to open iOS Settings (`Linking.openSettings()`)
- Don de soutien section: placeholder for In-App Purchase (react-native-iap integration)
- App version display

**Step 2: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: add settings screen with theme toggle and Focus guide"
```

---

### Task 10: Alarm Display Screen

**Files:**
- Create: `app/alarm-triggered.tsx`

**Step 1: Create full-screen alarm display**

Create `app/alarm-triggered.tsx`: Full-screen modal that appears when a notification is tapped. Shows:
- Bible verse (large, centered)
- Verse reference
- Audio controls (stop music)
- "Fermer" button
- Beautiful gradient/animated background

Wire up `onNotificationResponse` in `app/_layout.tsx` to navigate to this screen with verse data.

**Step 2: Commit**

```bash
git add app/alarm-triggered.tsx
git commit -m "feat: add alarm triggered screen with verse display"
```

---

### Task 11: In-App Purchase (Tip Jar)

**Files:**
- Create: `src/services/purchases.ts`
- Modify: `app/settings.tsx`

**Step 1: Install react-native-iap**

Run: `npx expo install react-native-iap`

**Step 2: Create purchase service**

Create `src/services/purchases.ts` with tip jar products (e.g., $1.99, $4.99, $9.99 tips). Initialize IAP connection, fetch products, handle purchase flow.

**Step 3: Add tip jar UI to settings**

Add a "Soutenir le developpement" section in settings with 3 tip buttons.

**Step 4: Commit**

```bash
git add src/services/purchases.ts app/settings.tsx
git commit -m "feat: add tip jar with in-app purchases"
```

---

### Task 12: Polish & EAS Build Setup

**Files:**
- Create: `eas.json`
- Modify: `app.json`

**Step 1: Configure EAS Build**

Run: `npx eas-cli@latest build:configure`

Create `eas.json`:
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_ASC_APP_ID"
      }
    }
  }
}
```

**Step 2: Add app icon and splash screen**

Add `assets/icon.png` (1024x1024) and `assets/splash.png` with Prayer Room branding.

**Step 3: Test build**

Run: `npx eas build --platform ios --profile preview`

**Step 4: Commit**

```bash
git add eas.json app.json assets/
git commit -m "feat: configure EAS Build for TestFlight distribution"
```

---

### Task 13: Final Testing & TestFlight

**Step 1: Test all flows on iOS Simulator**
- Create alarm with each interval preset
- Test each audio source type (native, builtin, custom)
- Verify verse rotation works across alarms
- Test pack browsing, custom pack creation
- Test theme toggle
- Verify notifications fire correctly

**Step 2: Build for TestFlight**

Run: `npx eas build --platform ios --profile production`

**Step 3: Submit to TestFlight**

Run: `npx eas submit --platform ios`

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: finalize Prayer Room V1.0 for TestFlight"
```
