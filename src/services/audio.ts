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

function getBuiltinAudioFile(trackId: string): any | null {
  try {
    switch (trackId) {
      case 'worship-piano-1':
        return require('../../assets/audio/worship-piano-1.mp3');
      case 'worship-piano-2':
        return require('../../assets/audio/worship-piano-2.mp3');
      case 'gentle-worship':
        return require('../../assets/audio/gentle-worship.mp3');
      case 'prayer-ambient':
        return require('../../assets/audio/prayer-ambient.mp3');
      case 'meditation-calm':
        return require('../../assets/audio/meditation-calm.mp3');
      default:
        return null;
    }
  } catch {
    return null;
  }
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
    case 'native':
      return;
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
  if (!Audio || source.type === 'native') return DEFAULT_DURATION;

  let soundFile: any;
  if (source.type === 'builtin') {
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
