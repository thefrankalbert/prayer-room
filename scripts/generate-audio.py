#!/usr/bin/env python3
"""Generate placeholder audio files for Prayer Room app.
Produces WAV files (which Expo AV can play) with distinct tones for each sound."""

import wave
import struct
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')
SAMPLE_RATE = 44100

def generate_tone(freq, duration, volume=0.5, fade_in=0.02, fade_out=0.1):
    """Generate a sine wave tone with fade in/out."""
    samples = []
    n_samples = int(SAMPLE_RATE * duration)
    fade_in_samples = int(SAMPLE_RATE * fade_in)
    fade_out_samples = int(SAMPLE_RATE * fade_out)

    for i in range(n_samples):
        t = i / SAMPLE_RATE
        sample = volume * math.sin(2 * math.pi * freq * t)

        # Fade in
        if i < fade_in_samples:
            sample *= i / fade_in_samples
        # Fade out
        if i > n_samples - fade_out_samples:
            sample *= (n_samples - i) / fade_out_samples

        samples.append(sample)
    return samples

def generate_chord(freqs, duration, volume=0.3, fade_in=0.05, fade_out=0.5):
    """Generate multiple tones layered."""
    n_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * n_samples
    fade_in_samples = int(SAMPLE_RATE * fade_in)
    fade_out_samples = int(SAMPLE_RATE * fade_out)

    for freq in freqs:
        for i in range(n_samples):
            t = i / SAMPLE_RATE
            s = volume / len(freqs) * math.sin(2 * math.pi * freq * t)
            if i < fade_in_samples:
                s *= i / fade_in_samples
            if i > n_samples - fade_out_samples:
                s *= (n_samples - i) / fade_out_samples
            samples[i] += s
    return samples

def generate_ambient(base_freq, duration, volume=0.25):
    """Generate a slow-evolving ambient pad."""
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    fade_samples = int(SAMPLE_RATE * 2.0)  # 2s fade

    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Slow LFO modulation
        lfo = 1.0 + 0.3 * math.sin(2 * math.pi * 0.1 * t)
        # Multiple harmonics with detuning
        s = 0.0
        s += 0.4 * math.sin(2 * math.pi * base_freq * t * lfo)
        s += 0.3 * math.sin(2 * math.pi * base_freq * 1.5 * t)
        s += 0.2 * math.sin(2 * math.pi * base_freq * 2.0 * t * (1 + 0.1 * math.sin(2 * math.pi * 0.07 * t)))
        s += 0.1 * math.sin(2 * math.pi * base_freq * 3.0 * t)
        s *= volume

        # Fade in/out
        if i < fade_samples:
            s *= i / fade_samples
        if i > n_samples - fade_samples:
            s *= (n_samples - i) / fade_samples

        samples.append(s)
    return samples

def save_wav(filename, samples):
    """Save samples as 16-bit WAV."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with wave.open(filepath, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        for s in samples:
            s = max(-1.0, min(1.0, s))
            f.writeframes(struct.pack('<h', int(s * 32767)))
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  {filename} ({size_kb:.0f} KB, {len(samples)/SAMPLE_RATE:.1f}s)")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Generating notification sounds (3-5s)...")

    # 1. Default - clean double ping (C6)
    s = generate_tone(1047, 0.15, 0.5) + [0]*2200 + generate_tone(1047, 0.15, 0.4)
    s += [0] * (SAMPLE_RATE * 2)  # tail silence
    save_wav('default.wav', s)

    # 2. Tri-tone - three ascending notes
    s = generate_tone(880, 0.12, 0.4) + [0]*1100 + generate_tone(1047, 0.12, 0.4) + [0]*1100 + generate_tone(1319, 0.15, 0.45)
    s += [0] * (SAMPLE_RATE * 2)
    save_wav('tri-tone.wav', s)

    # 3. Bell - rich bell tone (E5 + harmonics)
    bell = []
    n = int(SAMPLE_RATE * 3.0)
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 1.5)
        s = 0.4 * math.sin(2 * math.pi * 659 * t) * env
        s += 0.2 * math.sin(2 * math.pi * 1318 * t) * math.exp(-t * 3)
        s += 0.1 * math.sin(2 * math.pi * 1977 * t) * math.exp(-t * 5)
        bell.append(s)
    save_wav('bell.wav', bell)

    # 4. Chime - gentle wind chime (G5 + B5)
    chime = []
    n = int(SAMPLE_RATE * 3.5)
    for i in range(n):
        t = i / SAMPLE_RATE
        env1 = math.exp(-t * 2.0)
        env2 = math.exp(-(t - 0.3) * 2.0) if t > 0.3 else 0
        s = 0.35 * math.sin(2 * math.pi * 784 * t) * env1
        s += 0.25 * math.sin(2 * math.pi * 988 * t) * env2
        s += 0.15 * math.sin(2 * math.pi * 1175 * t) * math.exp(-t * 3) if t > 0.15 else 0
        chime.append(s)
    save_wav('chime.wav', chime)

    # 5. Harp - harp-like pluck (C5 major arpeggio)
    harp = []
    notes = [(523, 0.0), (659, 0.15), (784, 0.3), (1047, 0.45)]
    n = int(SAMPLE_RATE * 4.0)
    for i in range(n):
        t = i / SAMPLE_RATE
        s = 0.0
        for freq, onset in notes:
            if t >= onset:
                dt = t - onset
                env = math.exp(-dt * 2.5)
                s += 0.25 * math.sin(2 * math.pi * freq * dt) * env
                s += 0.1 * math.sin(2 * math.pi * freq * 2 * dt) * env * math.exp(-dt * 4)
        harp.append(s)
    save_wav('harp.wav', harp)

    # 6. Shofar - raw brass-like tone with vibrato
    shofar = []
    n = int(SAMPLE_RATE * 4.0)
    for i in range(n):
        t = i / SAMPLE_RATE
        vibrato = 1 + 0.02 * math.sin(2 * math.pi * 5 * t)
        env = min(t / 0.3, 1.0) * (1 if t < 3.0 else math.exp(-(t - 3.0) * 3))
        s = 0.35 * math.sin(2 * math.pi * 233 * t * vibrato) * env  # Bb3
        s += 0.2 * math.sin(2 * math.pi * 466 * t * vibrato) * env
        s += 0.15 * math.sin(2 * math.pi * 699 * t) * env
        s += 0.08 * math.sin(2 * math.pi * 932 * t) * env * 0.5
        shofar.append(s)
    save_wav('shofar.wav', shofar)

    # 7. Gentle ping - soft single ping
    ping = []
    n = int(SAMPLE_RATE * 2.5)
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 3)
        s = 0.35 * math.sin(2 * math.pi * 1397 * t) * env  # F6
        s += 0.15 * math.sin(2 * math.pi * 2794 * t) * env * math.exp(-t * 6)
        ping.append(s)
    save_wav('gentle-ping.wav', ping)

    print("\nGenerating worship/ambient tracks (30-45s)...")

    # 8. Worship Piano 1 - C major chord progression pad
    save_wav('worship-piano-1.wav', generate_ambient(262, 35, 0.25))  # C4

    # 9. Worship Piano 2 - G major feel
    save_wav('worship-piano-2.wav', generate_ambient(196, 35, 0.25))  # G3

    # 10. Gentle Worship - warm F major
    save_wav('gentle-worship.wav', generate_ambient(175, 40, 0.22))  # F3

    # 11. Prayer Ambient - deep Bb pad
    save_wav('prayer-ambient.wav', generate_ambient(117, 45, 0.20))  # Bb2

    # 12. Meditation Calm - very soft D pad
    save_wav('meditation-calm.wav', generate_ambient(147, 40, 0.18))  # D3

    print("\nDone! All audio files generated.")

if __name__ == '__main__':
    main()
