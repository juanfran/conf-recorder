Conf Recorder is a Node.js application that joins a [BigBlueButton](https://bigbluebutton.org/) room, records the conversation, generates a transcription using Whisper, and provides a summary with an AI model.

## Requirements

- [NVM](https://github.com/nvm-sh/nvm) or Node.js 22
- [PNPM](https://pnpm.io/)

## Optional Dependencies

The following are required if you are running Whisper and the AI summarization model locally:

- [Insanely Fast Whisper](https://github.com/Vaibhavs10/insanely-fast-whisper)
- [Ollama](https://ollama.com/)

To compress your recordings, you'll need:

- [FFmpeg](https://ffmpeg.org/)

## Installation

1. Install Node.js using NVM (Node Version Manager):

   ```bash
   nvm install
   ```

2. Install the required dependencies:

   ```bash
   pnpm install
   ```

3. Copy the example environment configuration file:

   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file to match your desired configuration.

## Configuration

### Local Whisper and Summarization Setup

If you're running Whisper and the summarization model locally, configure your `.env` file as follows:

```bash
COMPRESS_RECORDING=True

# Use this token for Pyannote.audio to diarize the audio clips
HUGGINGFACE_TOKEN=

# Whisper configuration for local execution
WHISPER=LOCAL
LOCAL_WHISPER_MODEL=openai/whisper-large-v3
LOCAL_WHISPER_BATCH_SIZE=12

# Summarization configuration for local execution
SUMMARIZE=LOCAL
LOCAL_SUMMARIZE_MODEL=llama3.1:8b
```

After setting up your `.env` file, make sure to pull your chosen model with Ollama:

```bash
ollama pull llama3.1:8b
```

### Remote Whisper and Summarization Setup

For remote processing, Conf Recorder integrates with [Replicate](https://replicate.com/). Use the following configuration in your `.env` file:

```bash
COMPRESS_RECORDING=True

# Use this token for Pyannote.audio to diarize the audio clips
HUGGINGFACE_TOKEN=

# Remote Whisper configuration
WHISPER=REMOTE
REPLICATE_API_TOKEN=
REMOTE_WHISPER_MODEL=vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c
REMOTE_WHISPER_BATCH_SIZE=64

# Remote summarization configuration
SUMMARIZE=REMOTE
REMOTE_SUMMARIZE_MODEL=meta/meta-llama-3-70b-instruct
```

## Starting the Application

To start the application, run the following command, replacing `https://url/to/the/room` with the actual URL of the BigBlueButton room:

```bash
pnpm start https://url/to/the/room
```
