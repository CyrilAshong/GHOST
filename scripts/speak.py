# scripts/speak.py
#
# This script receives text and speaks it out loud.
# Node.js will call this script whenever Ghost needs to speak.

import pyttsx3
import sys

def speak(text):
    # Initialize the text-to-speech engine
    engine = pyttsx3.init()

    # Set speaking speed — 175 is natural conversation speed
    engine.setProperty('rate', 175)

    # Set volume — 1.0 is maximum
    engine.setProperty('volume', 1.0)

    # Get the available voices on your Windows system
    voices = engine.getProperty('voices')

    # Index 0 is usually a male voice
    # Index 1 is usually a female voice
    # Try both and pick whichever you prefer
    engine.setProperty('voice', voices[0].id)

    # Queue the text to be spoken
    engine.say(text)

    # Block until speaking is finished then clean up
    engine.runAndWait()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Join all arguments into one string
        # sys.argv[1:] skips the script name itself
        text = " ".join(sys.argv[1:])
        speak(text)