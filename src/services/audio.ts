import { Audio } from 'expo-av';
import { AudioSource } from '../types';

let currentSound: Audio.Sound | null = null;

/**
 * Lazily load builtin audio files. We use a function instead of top-level
 * require() calls so the app does not crash if the MP3 files have not yet
 * been added to assets/audio/.
 */
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
    console.warn(`[AudioService] Builtin audio file not found for track: ${trackId}`);
    return null;
  }
}

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
      // Native sounds are handled by the notification system
      return;
    case 'builtin': {
      const file = getBuiltinAudioFile(source.trackId);
      if (!file) return;
      const { sound: s } = await Audio.Sound.createAsync(file);
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
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Sound may already be unloaded
    }
    currentSound = null;
  }
}

export async function getAudioDuration(source: AudioSource): Promise<number> {
  const DEFAULT_DURATION = 30000; // 30s

  if (source.type === 'native') return DEFAULT_DURATION;

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
