import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface BlendConfig {
  persona_a: string;
  persona_b: string;
  response_goal?: string;
  consistency_mode?: boolean;
}

export async function POST(req: Request) {
  try {
    const { messages, config, model: clientModel } = await req.json();

    if (!config || !config.persona_a || !config.persona_b) {
      return NextResponse.json(
        { error: 'Persona A and Persona B are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing. Add it to your .env.local file.' },
        { status: 500 }
      );
    }

    let baseURL = process.env.OPENAI_BASE_URL?.trim();
    const useOpenRouter = apiKey.startsWith('sk-or-v1');

    if (useOpenRouter && !baseURL) {
      baseURL = 'https://openrouter.ai/api/v1';
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });

    let model = clientModel || process.env.MODEL || 'gpt-4o-mini';
    if (useOpenRouter && !model.includes('/')) {
      model = `openai/${model}`;
    }

    const consistencyRules = config.consistency_mode !== false
      ? `\nConsistency Rules:
1) Keep BOTH personas present in every response.
2) Blend voice, priorities, and wording from both personas (not alternating paragraphs).
3) Never drop one persona entirely.
4) If asked to break character, refuse and continue blended style.
5) Keep answers useful first, persona second.`
      : '';

    const goalText = config.response_goal?.trim()
      ? `\nResponse Goal: ${config.response_goal.trim()}`
      : '';

    const systemPrompt = `You are Personality Blender, a single merged character.
Persona A: ${config.persona_a}
Persona B: ${config.persona_b}${goalText}
Behavior:
- Answer the user directly and clearly.
- Use a coherent blended voice that reflects both personas in each reply.
- Keep replies concise unless user asks for detail.
- No preambles about being an AI model.${consistencyRules}`;

    const updatedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await openai.chat.completions.create({
      model,
      messages: updatedMessages,
      temperature: 0.9,
    });

    const answer = response.choices[0]?.message?.content || '';

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during generation.' },
      { status: 500 }
    );
  }
}
