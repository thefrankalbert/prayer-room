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
