# scripts/listen.py
#
# Records audio from the microphone and transcribes it using Google Speech Recognition.
# Called by Node.js as a child process.
#
# Communication protocol with Node.js:
#   RECORDING     — microphone is now active
#   DONE          — recording finished
#   TRANSCRIBING  — Google is processing
#   RESULT:text   — the transcribed text

import speech_recognition as sr
import sys
import os

def main():
    # Create a recognizer instance
    recognizer = sr.Recognizer()

    try:
        # Use the default microphone as the audio source
        with sr.Microphone() as source:
            print("RECORDING", flush=True)

            # Adjust for ambient noise before recording
            # This helps with background noise in your room
            recognizer.adjust_for_ambient_noise(source, duration=1)

            # Listen for speech
            # timeout=10 means wait up to 10 seconds for speech to start
            # phrase_time_limit=7 means stop after 7 seconds of speech
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=7)

            print("DONE", flush=True)

        # Send audio to Google for transcription
        print("TRANSCRIBING", flush=True)
        text = recognizer.recognize_google(audio)

        # Send result to Node.js
        print(f"RESULT:{text}", flush=True)

    except sr.WaitTimeoutError:
        # No speech detected within the timeout period
        print("RESULT:", flush=True)

    except sr.UnknownValueError:
        # Google could not understand the audio
        print("RESULT:", flush=True)

    except sr.RequestError as e:
        # Could not reach Google's servers
        print(f"ERROR:Google Speech API error: {str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)

    except Exception as e:
        print(f"ERROR:{str(e)}", file=sys.stderr, flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()