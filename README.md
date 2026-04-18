# Personality Blender

A CLI tool that fuses two distinct personas into one consistent character voice and answers your questions in that blended style.

## Features

- Blend any two personas (e.g., "Sherlock Holmes" + "Gordon Ramsay")
- Keeps both styles active in every response
- Interactive chat loop
- Optional consistency mode to reinforce both personas over time

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create `.env` from `.env.example` and set your API key:

```env
OPENAI_API_KEY="API_KEY"
MODEL=gpt-4o-mini
OPENAI_BASE_URL=
```

If you use an OpenRouter key (`API_KEY`), set:

```env
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

## Run

```bash
python personality_blender.py
```

## Usage

1. Enter Persona A
2. Enter Persona B
3. Optionally define a response goal (e.g., "be concise and funny")
4. Ask questions; type `/reset` to choose new personas, `/quit` to exit

## Prompting challenge

The hard part is consistency: the model must preserve the signature traits of *both* personas in every turn without drifting into only one.
