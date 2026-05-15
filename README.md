# Ghost — Desktop AI Assistant

Ghost is a smart desktop AI assistant built from scratch using Node.js and Python.
Inspired by Siri, Jarvis, and ChatGPT desktop assistants.
Built phase by phase with clean architecture and real engineering practices.

---

## Project Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Terminal text assistant | ✅ Complete |
| Phase 2 | Voice assistant | ✅ Complete |
| Phase 3 | System automation | ✅ Complete |
| Phase 4 | Wake word detection | ✅ Complete |
| Phase 5 | Desktop GUI with Electron | 🔜 Coming soon |
| Phase 6 | Memory and personalization | 🔜 Coming soon |
| Phase 7 | Local AI support | 🔜 Coming soon |
| Phase 8 | Plugins and tool system | 🔜 Coming soon |

---

## What Ghost Can Do Right Now

- Accept typed messages and respond intelligently using DeepSeek AI
- Remember the full conversation within a session
- Listen to your voice through the microphone
- Transcribe your speech using Google Speech Recognition
- Speak responses out loud using pyttsx3
- Open applications including Chrome, Spotify, Telegram, VSCode and Word
- Tell you the current time and date
- Check your battery level
- Run terminal commands
- Search for files on your computer
- Wake up automatically when you say Hey Ghost
- Stay awake and hold a full natural conversation
- Go back to sleep after 1 minute of inactivity or when told to
- Play a cinematic Titan chime when activated

---

## Requirements

Before setting up Ghost make sure you have the following installed:

- Node.js 18 or higher — https://nodejs.org
- Python 3.10 or higher — https://python.org
- Git — https://git-scm.com
- ffmpeg — https://www.gyan.dev/ffmpeg/builds

### ffmpeg Setup on Windows

1. Download ffmpeg-release-essentials.zip from the link above
2. Extract it to C:\ffmpeg
3. Add C:\ffmpeg\ffmpeg-8.1.1-essentials_build\bin to your system PATH
4. Restart your terminal and verify with: ffmpeg -version

---

## Installation

### 1. Clone the repository

```
git clone https://github.com/CyrilAshong/GHOST.git
cd GHOST
```

### 2. Install Node.js dependencies

```
npm install
```

### 3. Install Python dependencies

```
pip install pyttsx3
pip install sounddevice
pip install soundfile
pip install numpy
pip install SpeechRecognition
pip install pyaudio --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

### 4. Set up your environment variables

Create a file called .env in the root of the project and add this:

```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

To get your DeepSeek API key:
1. Go to https://platform.deepseek.com
2. Create an account
3. Navigate to API Keys
4. Generate a new key and paste it above

---

## Running Ghost

### Text Mode

Ghost responds to messages you type in the terminal.

```
npm start
```

Example:

```
Ghost [Text Mode] — type your message. 'exit' to quit.
──────────────────────────────────────────────────
You: What is the capital of France?
Ghost: Paris.

You: Open Spotify
Ghost: Opening Spotify now.

You: exit
Ghost: Goodbye.
```

### Voice Mode

Ghost listens to your microphone, transcribes your speech,
and speaks its response out loud.

```
npm run voice
```

Example:

```
Ghost [Voice Mode] — Press Enter to speak. Type 'exit' to quit.
──────────────────────────────────────────────────

Press Enter to speak (or type 'exit'):
🎙️  Preparing microphone...
🔴 Listening... Speak now!
✅ Got it.
🔄 Transcribing...
📝 You said: "Open Chrome"

Ghost: Opening Chrome now.
```

### Wake Word Mode

Ghost listens continuously in the background.
Say Hey Ghost to activate it then have a full natural conversation.
Ghost stays awake until you say goodbye or go quiet for 1 minute.

```
npm run wake
```

Example:

```
Ghost [Wake Word Mode] — Say 'Hey Ghost' to activate.
Say 'I'm done' or 'Goodbye' to end the conversation.
Press Ctrl+C to quit.
──────────────────────────────────────────────────
👻 Ghost is listening for wake word...

✅ Wake word detected!

Ghost: Yeah, what's up.

📝 You: "What time is it"
Ghost: It is 10:45:30 on Thursday, 15 May 2026.

📝 You: "Open Spotify"
Ghost: Opening Spotify now.

📝 You: "I'm done"
Ghost: Alright, catch you later.

👻 Ghost is listening for wake word...
```

### Development Mode

Automatically restarts Ghost when you save changes.

```
npm run dev
npm run dev:voice
npm run dev:wake
```

---

## Project Structure

```
ghost/
├── src/
│   ├── ai/
│   │   └── openai.js            — DeepSeek AI chat integration
│   ├── chat/
│   │   └── conversation.js      — manages conversation history
│   ├── voice/
│   │   ├── tts.js               — text to speech module
│   │   ├── stt.js               — speech to text module
│   │   └── wakeWord.js          — wake word listener
│   ├── tools/
│   │   ├── index.js             — tool registry and intent classifier
│   │   ├── openApp.js           — opens applications
│   │   ├── runCommand.js        — runs terminal commands
│   │   ├── getTime.js           — returns current time and date
│   │   ├── getBattery.js        — returns battery level
│   │   └── searchFiles.js       — searches for files
│   ├── ghost.js                 — core engine, wires everything together
│   └── index.js                 — entry point, starts the correct mode
├── scripts/
│   ├── speak.py                 — pyttsx3 text to speech script
│   ├── listen.py                — Google Speech Recognition script
│   ├── wake.py                  — wake word detection script
│   └── chime.py                 — Titan wake sound generator
├── .env                         — API keys, never committed to Git
├── .gitignore                   — files Git ignores
├── package.json                 — Node.js project config and scripts
└── README.md                    — this file
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | Core application runtime |
| AI Chat | DeepSeek API | Generates intelligent responses |
| Speech Recognition | Google Speech Recognition | Converts voice to text |
| Text to Speech | pyttsx3 | Converts text to spoken audio |
| Audio Recording | sounddevice | Captures microphone input |
| Wake Word | Google Speech Recognition | Detects Hey Ghost trigger |
| Wake Sound | numpy and sounddevice | Generates cinematic Titan chime |
| System Automation | Node.js child_process | Opens apps and runs commands |
| Version Control | Git and GitHub | Tracks changes and backs up code |
| Desktop GUI | Electron | Coming in Phase 5 |
| Database | PostgreSQL and Prisma | Coming in Phase 6 |

---

## Available Commands

| Command | Description |
|---|---|
| npm start | Start Ghost in text mode |
| npm run voice | Start Ghost in voice mode |
| npm run wake | Start Ghost in wake word mode |
| npm run dev | Text mode with auto restart on file changes |
| npm run dev:voice | Voice mode with auto restart on file changes |
| npm run dev:wake | Wake word mode with auto restart on file changes |

---

## Ghost Commands

### Open Applications
```
Open Chrome
Open Spotify
Open Telegram
Open VSCode
Open Word
Open Notepad
Open Calculator
Open File Explorer
```

### System Information
```
What time is it
What is my battery level
```

### Run Terminal Commands
```
Run ipconfig
Run dir
```

### Search Files
```
Find file resume
Search for notes
```

### Wake Word
```
Hey Ghost
Hey Google  (Google sometimes mishears Hey Ghost as this)
```

### End a Wake Word Session
```
I'm done
Goodbye
That's all
Sleep
Bye
```

---

## Architecture Decisions

### Why DeepSeek instead of OpenAI?
DeepSeek offers competitive AI quality at significantly lower cost.
Its API is fully compatible with the OpenAI SDK format so switching
required changing only one file.

### Why Google Speech Recognition instead of Whisper?
Whisper required ffmpeg and caused compatibility issues on Windows.
Google Speech Recognition is faster, more accurate, requires no local
model downloads, and works reliably across platforms.

### Why Python for audio?
Python has mature, stable audio libraries that work reliably on Windows.
Node.js audio libraries frequently have native dependency issues on Windows.
Ghost uses Node.js for all application logic and Python only for audio tasks.

### Why a tool registry pattern?
Each tool is its own module with one job. Adding a new tool means
creating one file and registering it in index.js. Nothing else changes.
This makes the tool system infinitely expandable.

### Why numpy for the wake sound?
Generating audio mathematically means no sound files to manage or commit.
The chime is created from scratch using sine waves, reverb, and envelopes.
It can be fully customized in code.

### Why does Ghost stay awake after the wake word?
A real conversation does not stop after one sentence. Ghost stays awake
and listens naturally until the user says goodbye or goes quiet for
1 minute. This makes it feel like talking to a person not a voice assistant.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| DEEPSEEK_API_KEY | Yes | Your DeepSeek API key for AI chat |

---

## Common Issues

### Ghost gives no response
Check that your DEEPSEEK_API_KEY is correctly set in your .env file.

### Microphone not detected
Make sure your microphone is set as the default recording device
in Windows Sound Settings.

### Google Speech Recognition returns nothing
Make sure you are connected to the internet.
Google processes the audio on their servers.

### Wake word not triggering
Speak clearly and say Hey Ghost slowly.
Google sometimes transcribes it as Hey Google which also works.
Watch the terminal to see exactly what Google is hearing.

### Ghost goes back to sleep too quickly
Ghost waits 1 minute of real silence before sleeping.
Make sure you are speaking clearly after Ghost finishes responding.

### App will not open
The app may be installed in a custom location. Find the exe path
and add it manually to the APP_MAP in src/tools/openApp.js.

---

## Version Control

This project uses Git from day one.
Every major milestone has a meaningful commit so the full
development history is preserved.

View the commit history:

```
git log --oneline
```

---

## Author

Built by Cyril Ashong
GitHub: https://github.com/CyrilAshong