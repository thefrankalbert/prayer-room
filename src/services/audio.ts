import { AudioSource } from '../types';

// expo-av may not be available in Expo Go (SDK 55+).
// All functions degrade gracefully when the native module is missing.
let Audio: any = null;
try {
  Audio = require('expo-av').Audio;
} catch {
  console.warn('[AudioService] expo-av not available — audio playback disabled');
}

let currentSound: any = null;

function getNativeAudioFile(soundId: string): any | null {
  const NATIVE_FILES: Record<string, any> = {};
  try { NATIVE_FILES['default'] = require('../../assets/audio/default.mp3'); } catch {}
  try { NATIVE_FILES['tri-tone'] = require('../../assets/audio/tri-tone.mp3'); } catch {}
  try { NATIVE_FILES['bell'] = require('../../assets/audio/bell.mp3'); } catch {}
  try { NATIVE_FILES['chime'] = require('../../assets/audio/chime.mp3'); } catch {}
  try { NATIVE_FILES['harp'] = require('../../assets/audio/harp.mp3'); } catch {}
  try { NATIVE_FILES['shofar'] = require('../../assets/audio/shofar.mp3'); } catch {}
  try { NATIVE_FILES['gentle-ping'] = require('../../assets/audio/gentle-ping.mp3'); } catch {}
  return NATIVE_FILES[soundId] ?? null;
}

function getBuiltinAudioFile(trackId: string): any | null {
  const AUDIO_FILES: Record<string, any> = {};
  try { AUDIO_FILES['worship-piano-1'] = require('../../assets/audio/worship-piano-1.mp3'); } catch {}
  try { AUDIO_FILES['worship-piano-2'] = require('../../assets/audio/worship-piano-2.mp3'); } catch {}
  try { AUDIO_FILES['gentle-worship'] = require('../../assets/audio/gentle-worship.mp3'); } catch {}
  try { AUDIO_FILES['prayer-ambient'] = require('../../assets/audio/prayer-ambient.mp3'); } catch {}
  try { AUDIO_FILES['meditation-calm'] = require('../../assets/audio/meditation-calm.mp3'); } catch {}
  return AUDIO_FILES[trackId] ?? null;
}

export async function playAudio(source: AudioSource): Promise<void> {
  if (!Audio) return;
  await stopAudio();

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
  } catch {
    return;
  }

  let sound: any;

  switch (source.type) {
    case 'native': {
      const nativeFile = getNativeAudioFile(source.soundId);
      if (!nativeFile) return;
      try {
        const result = await Audio.Sound.createAsync(nativeFile);
        sound = result.sound;
      } catch { return; }
      break;
    }
    case 'builtin': {
      const file = getBuiltinAudioFile(source.trackId);
      if (!file) return;
      try {
        const result = await Audio.Sound.createAsync(file);
        sound = result.sound;
      } catch { return; }
      break;
    }
    case 'custom': {
      try {
        const result = await Audio.Sound.createAsync({ uri: source.uri });
        sound = result.sound;
      } catch { return; }
      break;
    }
  }

  currentSound = sound;
  try { await sound.playAsync(); } catch { /* */ }
}

export async function stopAudio(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch { /* */ }
    currentSound = null;
  }
}

export async function getAudioDuration(source: AudioSource): Promise<number> {
  const DEFAULT_DURATION = 30000;
  if (!Audio) return DEFAULT_DURATION;

  let soundFile: any;
  if (source.type === 'native') {
    soundFile = getNativeAudioFile(source.soundId);
    if (!soundFile) return DEFAULT_DURATION;
  } else if (source.type === 'builtin') {
    soundFile = getBuiltinAudioFile(source.trackId);
    if (!soundFile) return DEFAULT_DURATION;
  } else {
    soundFile = { uri: source.uri };
  }

  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    const status = await sound.getStatusAsync();
    const duration = status.isLoaded ? status.durationMillis ?? DEFAULT_DURATION : DEFAULT_DURATION;
    await sound.unloadAsync();
    return duration;
  } catch {
    return DEFAULT_DURATION;
  }
}
