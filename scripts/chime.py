# scripts/chime.py
#
# Ghost wake sound — Titan Waking.
# An enormous deep BOOM followed by a rising rumble.
# Like a giant opening its eyes. Felt more than heard.

import numpy as np
import sounddevice as sd

SAMPLE_RATE = 44100

def play_wake_chime():
    duration = 2.8
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)

    # ── BOOM LAYER 1 — The initial impact ─────────────────────────
    # A massive low frequency hit at the very start
    # Like a giant fist hitting the ground
    boom_duration = int(SAMPLE_RATE * 0.6)
    boom_t = np.linspace(0, 1, boom_duration)
    boom_freq = np.linspace(60, 20, boom_duration)
    boom_phase = 2 * np.pi * np.cumsum(boom_freq) / SAMPLE_RATE
    boom = np.sin(boom_phase) * 0.95

    # Boom envelope — instant attack, slow decay
    # Like a cannon shot — hits hard then fades naturally
    boom_env = np.exp(-boom_t * 3.5)
    boom *= boom_env

    # Pad boom to full length
    boom_layer = np.zeros(len(t))
    boom_layer[:boom_duration] = boom

    # ── BOOM LAYER 2 — Sub bass hit ───────────────────────────────
    # Even lower than layer 1 — pure physical impact
    boom2_duration = int(SAMPLE_RATE * 0.8)
    boom2_t = np.linspace(0, 1, boom2_duration)
    boom2_freq = np.linspace(35, 8, boom2_duration)
    boom2_phase = 2 * np.pi * np.cumsum(boom2_freq) / SAMPLE_RATE
    boom2 = np.sin(boom2_phase) * 0.90

    boom2_env = np.exp(-boom2_t * 2.5)
    boom2 *= boom2_env

    boom2_layer = np.zeros(len(t))
    boom2_layer[:boom2_duration] = boom2

    # ── RUMBLE — Rising after the boom ───────────────────────────
    # Starts after the initial hit and rises slowly
    # Like the ground shaking after a titan stands up
    rumble_start = int(SAMPLE_RATE * 0.25)
    rumble_len = len(t) - rumble_start

    freq_rumble = np.linspace(25, 180, rumble_len)
    phase_rumble = 2 * np.pi * np.cumsum(freq_rumble) / SAMPLE_RATE
    rumble = np.sin(phase_rumble) * 0.70

    # Rumble builds in slowly
    rumble_env = np.linspace(0, 1, rumble_len) ** 0.6
    rumble *= rumble_env

    rumble_layer = np.zeros(len(t))
    rumble_layer[rumble_start:] = rumble

    # ── GROUND SHAKE — Low frequency tremor ──────────────────────
    # A slow oscillating tremor beneath the rumble
    # Like the earth itself is vibrating from the titans weight
    shake_freq = 7  # 7Hz — below musical pitch, pure vibration
    shake = np.sin(2 * np.pi * shake_freq * t) * 0.55

    freq_shake2 = np.linspace(15, 60, len(t))
    phase_shake2 = 2 * np.pi * np.cumsum(freq_shake2) / SAMPLE_RATE
    shake_carrier = np.sin(phase_shake2)
    shake_layer = shake_carrier * shake * 0.65

    # Shake builds in after the boom
    shake_env = np.zeros(len(t))
    shake_start = int(len(t) * 0.15)
    shake_env[shake_start:] = np.linspace(0, 1, len(t) - shake_start) ** 0.8
    shake_layer *= shake_env

    # ── RISING TONE — The titan fully wakes ──────────────────────
    # A powerful rising tone that enters after the rumble
    # Like the titans voice — deep, massive, undeniable
    rise_start = int(SAMPLE_RATE * 0.55)
    rise_len = len(t) - rise_start

    freq_rise = np.linspace(80, 320, rise_len)
    phase_rise = 2 * np.pi * np.cumsum(freq_rise) / SAMPLE_RATE
    rise = np.sin(phase_rise) * 0.65

    rise_env = np.linspace(0, 1, rise_len) ** 0.5
    rise *= rise_env

    rise_layer = np.zeros(len(t))
    rise_layer[rise_start:] = rise

    # ── HARMONIC OVERTONE ─────────────────────────────────────────
    # Adds richness to the rising tone
    freq_harm = np.linspace(160, 640, rise_len)
    phase_harm = 2 * np.pi * np.cumsum(freq_harm) / SAMPLE_RATE
    harmonic = np.sin(phase_harm) * 0.25 * rise_env

    harmonic_layer = np.zeros(len(t))
    harmonic_layer[rise_start:] = harmonic

    # ── HIGH SHIMMER — Energy radiating outward ───────────────────
    # Appears only at the very end when the titan is fully awake
    shimmer_start = int(len(t) * 0.72)
    shimmer_len = len(t) - shimmer_start

    freq_shimmer = np.linspace(800, 2000, shimmer_len)
    phase_shimmer = 2 * np.pi * np.cumsum(freq_shimmer) / SAMPLE_RATE
    shimmer = np.sin(phase_shimmer) * 0.10

    shimmer_env = np.linspace(0, 1, shimmer_len) ** 1.2
    shimmer *= shimmer_env

    shimmer_layer = np.zeros(len(t))
    shimmer_layer[shimmer_start:] = shimmer

    # ── COMBINE ALL LAYERS ────────────────────────────────────────
    combined = (
        boom_layer +
        boom2_layer +
        rumble_layer +
        shake_layer +
        rise_layer +
        harmonic_layer +
        shimmer_layer
    )

    # ── MASTER VOLUME ENVELOPE ────────────────────────────────────
    envelope = np.ones(len(t))

    # Instant full volume at start for the boom impact
    # No build in — the boom hits immediately
    envelope[:int(len(t) * 0.02)] = np.linspace(0, 1, int(len(t) * 0.02))

    # Fade out at the end
    fade_start = int(len(t) * 0.82)
    fade_len = len(t) - fade_start
    envelope[fade_start:] = np.linspace(1, 0, fade_len) ** 1.6

    combined *= envelope

    # ── REVERB — CANYON ECHO ──────────────────────────────────────
    # Like the boom is echoing off canyon walls
    # Massive and open sounding
    delay1 = int(SAMPLE_RATE * 0.14)
    reverb1 = np.zeros(len(combined) + delay1)
    reverb1[:len(combined)] += combined
    reverb1[delay1:delay1 + len(combined)] += combined * 0.48

    # ── REVERB — DISTANT MOUNTAIN ECHO ───────────────────────────
    delay2 = int(SAMPLE_RATE * 0.30)
    reverb2 = np.zeros(len(reverb1) + delay2)
    reverb2[:len(reverb1)] += reverb1
    reverb2[delay2:delay2 + len(reverb1)] += reverb1 * 0.28

    # ── REVERB — FAR HORIZON TAIL ─────────────────────────────────
    delay3 = int(SAMPLE_RATE * 0.55)
    reverb3 = np.zeros(len(reverb2) + delay3)
    reverb3[:len(reverb2)] += reverb2
    reverb3[delay3:delay3 + len(reverb2)] += reverb2 * 0.14

    # ── NORMALIZE ─────────────────────────────────────────────────
    max_val = np.max(np.abs(reverb3))
    if max_val > 0:
        reverb3 = reverb3 / max_val * 0.92

    # ── PLAY ──────────────────────────────────────────────────────
    sd.play(reverb3.astype(np.float32), SAMPLE_RATE)
    sd.wait()

if __name__ == "__main__":
    play_wake_chime()