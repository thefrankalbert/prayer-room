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
