import { AudioSource } from '../types';

export const NATIVE_SOUNDS: AudioSource[] = [
  { type: 'native', soundId: 'default', name: 'audio.default' },
  { type: 'native', soundId: 'tri-tone', name: 'audio.tri_tone' },
  { type: 'native', soundId: 'bell', name: 'audio.bell' },
  { type: 'native', soundId: 'chime', name: 'audio.chime' },
  { type: 'native', soundId: 'harp', name: 'audio.harp' },
  { type: 'native', soundId: 'shofar', name: 'audio.shofar' },
  { type: 'native', soundId: 'gentle-ping', name: 'audio.gentle_ping' },
];

export const BUILTIN_TRACKS: AudioSource[] = [
  { type: 'builtin', trackId: 'worship-piano-1', name: 'audio.worship_piano_1' },
  { type: 'builtin', trackId: 'worship-piano-2', name: 'audio.worship_piano_2' },
  { type: 'builtin', trackId: 'gentle-worship', name: 'audio.gentle_worship' },
  { type: 'builtin', trackId: 'prayer-ambient', name: 'audio.prayer_ambient' },
  { type: 'builtin', trackId: 'meditation-calm', name: 'audio.meditation_calm' },
];
