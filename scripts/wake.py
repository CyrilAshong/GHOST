# scripts/wake.py
#
# Wake word detection for Ghost.
# Ghost stays awake and keeps listening naturally
# until the user says goodbye or goes quiet for a long time.

import speech_recognition as sr
import numpy as np
import sounddevice as sd
import sys

recognizer = sr.Recognizer()
recognizer.energy_threshold = 200        # very sensitive
recognizer.pause_threshold = 1.0
recognizer.dynamic_energy_threshold = False

# ── WAKE WORDS ─────────────────────────────────────────────────────
# We accept many variations because Google mishears Hey Ghost often
# The more variations we accept the more reliable the trigger becomes
WAKE_WORDS = [
    "hey ghost",
    "okay ghost",
    "ok ghost",
    "ghost",
    "hey gost",
    "a ghost",
    "hey go",
    "hey google",
    "hey goat",
    "hey coast",
    "hey most",
    "the ghost",
    "he ghost",
    "gay ghost",
    "hey post",
    "hey host",
    "wake up",
]

# ── SLEEP WORDS ────────────────────────────────────────────────────
SLEEP_WORDS = [
    "i'm done",
    "im done",
    "that's all",
    "thats all",
    "goodbye",
    "go to sleep",
    "sleep",
    "stop listening",
    "done",
    "bye ghost",
    "bye",
    "go back to sleep",
    "thank you ghost",
    "thanks ghost",
    "see you",
    "later ghost",
    "that will be all",
]

def contains_wake_word(text):
    text = text.lower().strip()
    return any(word in text for word in WAKE_WORDS)

def contains_sleep_word(text):
    text = text.lower().strip()
    return any(word in text for word in SLEEP_WORDS)

# ── CHIME ──────────────────────────────────────────────────────────

SAMPLE_RATE = 44100

def play_wake_chime():
    duration = 2.8
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)

    boom_duration = int(SAMPLE_RATE * 0.6)
    boom_t = np.linspace(0, 1, boom_duration)
    boom_freq = np.linspace(60, 20, boom_duration)
    boom_phase = 2 * np.pi * np.cumsum(boom_freq) / SAMPLE_RATE
    boom = np.sin(boom_phase) * 0.95
    boom_env = np.exp(-boom_t * 3.5)
    boom *= boom_env
    boom_layer = np.zeros(len(t))
    boom_layer[:boom_duration] = boom

    boom2_duration = int(SAMPLE_RATE * 0.8)
    boom2_t = np.linspace(0, 1, boom2_duration)
    boom2_freq = np.linspace(35, 8, boom2_duration)
    boom2_phase = 2 * np.pi * np.cumsum(boom2_freq) / SAMPLE_RATE
    boom2 = np.sin(boom2_phase) * 0.90
    boom2_env = np.exp(-boom2_t * 2.5)
    boom2 *= boom2_env
    boom2_layer = np.zeros(len(t))
    boom2_layer[:boom2_duration] = boom2

    rumble_start = int(SAMPLE_RATE * 0.25)
    rumble_len = len(t) - rumble_start
    freq_rumble = np.linspace(25, 180, rumble_len)
    phase_rumble = 2 * np.pi * np.cumsum(freq_rumble) / SAMPLE_RATE
    rumble = np.sin(phase_rumble) * 0.70
    rumble_env = np.linspace(0, 1, rumble_len) ** 0.6
    rumble *= rumble_env
    rumble_layer = np.zeros(len(t))
    rumble_layer[rumble_start:] = rumble

    shake_freq = 7
    shake = np.sin(2 * np.pi * shake_freq * t) * 0.55
    freq_shake2 = np.linspace(15, 60, len(t))
    phase_shake2 = 2 * np.pi * np.cumsum(freq_shake2) / SAMPLE_RATE
    shake_carrier = np.sin(phase_shake2)
    shake_layer = shake_carrier * shake * 0.65
    shake_env = np.zeros(len(t))
    shake_start = int(len(t) * 0.15)
    shake_env[shake_start:] = np.linspace(0, 1, len(t) - shake_start) ** 0.8
    shake_layer *= shake_env

    rise_start = int(SAMPLE_RATE * 0.55)
    rise_len = len(t) - rise_start
    freq_rise = np.linspace(80, 320, rise_len)
    phase_rise = 2 * np.pi * np.cumsum(freq_rise) / SAMPLE_RATE
    rise = np.sin(phase_rise) * 0.65
    rise_env = np.linspace(0, 1, rise_len) ** 0.5
    rise *= rise_env
    rise_layer = np.zeros(len(t))
    rise_layer[rise_start:] = rise

    freq_harm = np.linspace(160, 640, rise_len)
    phase_harm = 2 * np.pi * np.cumsum(freq_harm) / SAMPLE_RATE
    harmonic = np.sin(phase_harm) * 0.25 * rise_env
    harmonic_layer = np.zeros(len(t))
    harmonic_layer[rise_start:] = harmonic

    shimmer_start = int(len(t) * 0.72)
    shimmer_len = len(t) - shimmer_start
    freq_shimmer = np.linspace(800, 2000, shimmer_len)
    phase_shimmer = 2 * np.pi * np.cumsum(freq_shimmer) / SAMPLE_RATE
    shimmer = np.sin(phase_shimmer) * 0.10
    shimmer_env = np.linspace(0, 1, shimmer_len) ** 1.2
    shimmer *= shimmer_env
    shimmer_layer = np.zeros(len(t))
    shimmer_layer[shimmer_start:] = shimmer

    combined = (
        boom_layer + boom2_layer + rumble_layer +
        shake_layer + rise_layer + harmonic_layer + shimmer_layer
    )

    envelope = np.ones(len(t))
    envelope[:int(len(t) * 0.02)] = np.linspace(0, 1, int(len(t) * 0.02))
    fade_start = int(len(t) * 0.82)
    fade_len = len(t) - fade_start
    envelope[fade_start:] = np.linspace(1, 0, fade_len) ** 1.6
    combined *= envelope

    delay1 = int(SAMPLE_RATE * 0.14)
    reverb1 = np.zeros(len(combined) + delay1)
    reverb1[:len(combined)] += combined
    reverb1[delay1:delay1 + len(combined)] += combined * 0.48

    delay2 = int(SAMPLE_RATE * 0.30)
    reverb2 = np.zeros(len(reverb1) + delay2)
    reverb2[:len(reverb1)] += reverb1
    reverb2[delay2:delay2 + len(reverb1)] += reverb1 * 0.28

    delay3 = int(SAMPLE_RATE * 0.55)
    reverb3 = np.zeros(len(reverb2) + delay3)
    reverb3[:len(reverb2)] += reverb2
    reverb3[delay3:delay3 + len(reverb2)] += reverb2 * 0.14

    max_val = np.max(np.abs(reverb3))
    if max_val > 0:
        reverb3 = reverb3 / max_val * 0.92

    sd.play(reverb3.astype(np.float32), SAMPLE_RATE)
    sd.wait()

# ── LISTENING HELPER ───────────────────────────────────────────────

def listen_once(source, timeout=6, phrase_limit=8):
    """
    Listens for one utterance and returns transcribed text.
    Returns None if nothing was heard or understood.
    """
    try:
        audio = recognizer.listen(
            source,
            timeout=timeout,
            phrase_time_limit=phrase_limit
        )
        text = recognizer.recognize_google(audio)
        return text.strip()
    except sr.WaitTimeoutError:
        return None
    except sr.UnknownValueError:
        return None
    except sr.RequestError as e:
        print(f"ERROR:Google API error: {e}", file=sys.stderr, flush=True)
        return None

# ── MAIN LOOP ──────────────────────────────────────────────────────

def main():
    with sr.Microphone() as source:
        print("Calibrating...", flush=True)
        recognizer.adjust_for_ambient_noise(source, duration=1.5)
        print("LISTENING", flush=True)

        while True:

            # ── PHASE 1: Listen for wake word ──────────────────
            # Longer clip so Google has more audio to work with
            text = listen_once(source, timeout=6, phrase_limit=4)

            if not text:
                print("LISTENING", flush=True)
                continue

            if not contains_wake_word(text):
                print("LISTENING", flush=True)
                continue

            # ── PHASE 2: Wake word detected ────────────────────
            print("DETECTED", flush=True)
            play_wake_chime()
            print("AWAKE", flush=True)

            # ── PHASE 3: Conversation loop ─────────────────────
            # Ghost waits patiently after each response
            # silence_count only increments when the user
            # has not spoken AFTER Ghost has finished responding
            # It does NOT count silence during Ghost's response

            silence_count = 0
            max_silence = 5  # 3 real silences before sleeping

            while True:
                print("WAITING", flush=True)

                # Wait longer between turns — feels more natural
                command = listen_once(source, timeout=12, phrase_limit=10)

                if not command:
                    silence_count += 1

                    if silence_count >= max_silence:
                        # User has genuinely gone quiet — end session
                        print("SLEEPING", flush=True)
                        break

                    # Still waiting — do nothing, just keep listening
                    continue

                # Got a response — reset silence counter
                silence_count = 0

                # Check for goodbye
                if contains_sleep_word(command):
                    print("SLEEPING", flush=True)
                    break

                # Send command to Node.js
                print(f"COMMAND:{command}", flush=True)

                # Wait for Node.js to finish speaking before
                # listening again — this is critical
                # Without this Ghost starts listening while
                # it is still speaking and hears itself
                for line in sys.stdin:
                    if line.strip() == "READY":
                        break

            print("LISTENING", flush=True)

if __name__ == "__main__":
    main()