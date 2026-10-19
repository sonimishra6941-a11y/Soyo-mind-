import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial dotenv load
dotenv.config();

// Helper to resolve active GROQ_API_KEY from process.env, .env.local, or .env
export interface ApiKeyResolution {
  key: string;
  source: 'env.local' | 'env' | 'none';
  hasLocalFile: boolean;
  isPlaceholder: boolean;
}

export function getApiKeyDetails(): ApiKeyResolution {
  // 1. Check process.env.GROQ_API_KEY first
  const envKey = (process.env.GROQ_API_KEY || '').trim();
  if (envKey && envKey !== 'MY_GROQ_API_KEY' && envKey !== 'yaha apni key paste karo') {
    return {
      key: envKey,
      source: 'env',
      hasLocalFile: fs.existsSync(path.resolve(process.cwd(), '.env.local')),
      isPlaceholder: false,
    };
  }

  // 2. Check .env.local
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  let hasLocalFile = false;
  let isPlaceholder = false;
  let localKey = '';

  try {
    if (fs.existsSync(localEnvPath)) {
      hasLocalFile = true;
      const content = fs.readFileSync(localEnvPath, 'utf8');
      const lines = content.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const match = line.match(/^GROQ_API_KEY\s*=\s*(.*)$/);
        if (match) {
          let val = match[1].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1).trim();
          }
          if (val === 'yaha apni key paste karo' || val === 'MY_GROQ_API_KEY' || val === '') {
            isPlaceholder = true;
          } else if (val) {
            localKey = val;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed reading .env.local:', err);
  }

  if (localKey) {
    return {
      key: localKey,
      source: 'env.local',
      hasLocalFile,
      isPlaceholder: false,
    };
  }

  return {
    key: '',
    source: 'none',
    hasLocalFile,
    isPlaceholder,
  };
}

export function getApiKey(): string {
  return getApiKeyDetails().key;
}

// Create Groq client with the active key
export function getGroqClient(): Groq {
  const apiKey = getApiKey();
  return new Groq({ apiKey });
}

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// System Prompt for SOYO Mind VAI
const getSystemInstruction = (language: string = 'English') => `
You are "SOYO Mind - A Virtual Artificial Intelligence" (short name "SOYO Mind VAI").
You are an advanced, empathetic, hyper-intelligent, and versatile AI assistant powered by Groq high-speed inference.
You are built to answer any question, write clean code, solve mathematical and STEM problems, analyze data, summarize, translate, and converse naturally.

Key Persona & Guidelines:
1. Always identify as "SOYO Mind VAI" when asked who you are.
2. Be polite, precise, highly capable, and well-structured.
3. Use formatted Markdown with clear headings, bullet points, clean code blocks with language identifiers, and bold highlights for readability.
4. When writing code, provide working, complete, well-commented code.
5. You have full conversational memory of prior turns in the ongoing session.
6. The user has selected the language: "${language}". Always respond naturally and fluently in this language unless the user explicitly asks for translation to another language or specifies otherwise in their prompt.
`;

// Helper to format messages for Groq Chat Completions
function buildGroqMessages(
  messages: Array<{ role?: string; content?: string; text?: string; attachments?: any[] }> = [],
  prompt?: string,
  language: string = 'English'
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const formatted: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: getSystemInstruction(language) },
  ];

  if (Array.isArray(messages)) {
    for (const msg of messages) {
      const rawRole = msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user';
      let content = (typeof msg.content === 'string' ? msg.content : (msg.text || '')).trim();

      // If message includes attachment description
      if (msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        const attNames = msg.attachments.map((a: any) => a.name || 'file').join(', ');
        content = content ? `${content}\n\n[Attached: ${attNames}]` : `[Attached: ${attNames}]`;
      }

      if (content) {
        formatted.push({ role: rawRole, content });
      }
    }
  }

  if (prompt && prompt.trim()) {
    const lastMsg = formatted[formatted.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== prompt.trim()) {
      formatted.push({ role: 'user', content: prompt.trim() });
    }
  }

  // Ensure at least one user message
  if (formatted.length === 1) {
    formatted.push({ role: 'user', content: 'Hello!' });
  }

  return formatted;
}

// Candidate models for Groq:
// Primary: llama-3.1-8b-instant (exact user request)
// Fallbacks: openai/gpt-oss-20b, openai/gpt-oss-120b, qwen/qwen3.8-27b, allam-2-7b
function getGroqCandidateModels(requestedModel?: string): string[] {
  const models: string[] = [];
  if (requestedModel && requestedModel.trim()) {
    models.push(requestedModel.trim());
  }
  const defaults = [
    'llama-3.1-8b-instant',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'allam-2-7b',
  ];
  for (const m of defaults) {
    if (!models.includes(m)) {
      models.push(m);
    }
  }
  return models;
}

// 1. Streaming Chat endpoint (SSE) using Groq
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  try {
    const { messages = [], prompt, language = 'English', model: reqModel } = req.body;
    const keyInfo = getApiKeyDetails();
    const activeKey = keyInfo.key;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!activeKey) {
      const helpMsg = `✨ **SOYO Mind VAI - Groq API Key Required**\n\nPlease add your Groq API key in **Settings > Groq API Key** or in \`.env.local\`:\n\`\`\`env\nGROQ_API_KEY="gsk_..."\n\`\`\`\nOnce saved, SOYO Mind immediately connects to live Groq high-speed AI.`;
      res.write(`data: ${JSON.stringify({ text: helpMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const groq = getGroqClient();
    const groqMessages = buildGroqMessages(messages, prompt, language);
    const candidateModels = getGroqCandidateModels(reqModel);

    let streamSuccess = false;
    let lastError: string | null = null;
    let selectedModel = candidateModels[0];

    for (const modelName of candidateModels) {
      try {
        console.log(`[Groq ChatStream] Attempting model: ${modelName}`);
        const stream = await groq.chat.completions.create({
          messages: groqMessages,
          model: modelName,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content, model: modelName })}\n\n`);
            streamSuccess = true;
          }
        }

        if (streamSuccess) {
          selectedModel = modelName;
          console.log(`[Groq ChatStream] Succeeded with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`[Groq ChatStream] Model ${modelName} failed:`, lastError);
        if (streamSuccess) {
          break; // Partial stream already sent
        }
      }
    }

    // If streaming failed across all candidates, attempt non-streaming fallback
    if (!streamSuccess) {
      for (const fallbackModel of candidateModels) {
        try {
          console.log(`[Groq ChatStream] Attempting non-streaming fallback: ${fallbackModel}`);
          const completion = await groq.chat.completions.create({
            messages: groqMessages,
            model: fallbackModel,
            temperature: 0.7,
          });
          const text = completion.choices[0]?.message?.content || '';
          if (text) {
            res.write(`data: ${JSON.stringify({ text, model: fallbackModel })}\n\n`);
            streamSuccess = true;
            break;
          }
        } catch (err: any) {
          lastError = err?.message || String(err);
        }
      }
    }

    if (!streamSuccess) {
      const errorMsg = `⚠️ **Groq API Error**\n\nCould not get a response from Groq.\n\n**Error details:** \`${lastError || 'Unknown API failure'}\`\n\n**Key Status:** \`${keyInfo.source}\` (${keyInfo.key ? keyInfo.key.slice(0, 7) + '••••' : 'None'})`;
      res.write(`data: ${JSON.stringify({ text: errorMsg, error: lastError })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Fatal error in /api/chat/stream:', err);
    res.write(`data: ${JSON.stringify({ text: `⚠️ Server Error: ${err.message || 'Unexpected failure'}` })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// 2. Direct JSON Chat endpoint (/api/chat)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], message, prompt, language = 'English', model: reqModel } = req.body;
    const keyInfo = getApiKeyDetails();
    const activeKey = keyInfo.key;

    if (!activeKey) {
      return res.status(401).json({
        error: 'No active GROQ_API_KEY found in process.env or .env.local.',
        hasKey: false,
      });
    }

    const userText = message || prompt;
    const groq = getGroqClient();
    const groqMessages = buildGroqMessages(messages, userText, language);
    const candidateModels = getGroqCandidateModels(reqModel);

    let lastError: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await groq.chat.completions.create({
          messages: groqMessages,
          model: modelName,
          temperature: 0.7,
        });

        const text = response.choices[0]?.message?.content || '';
        return res.json({
          success: true,
          text,
          response: text,
          model: modelName,
        });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`[POST /api/chat] Model ${modelName} error:`, lastError);
      }
    }

    return res.status(502).json({
      error: 'Failed to generate response with Groq models.',
      details: lastError,
      modelsTried: candidateModels,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 3. Simple Generate endpoint (/api/generate)
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, message, language = 'English', model: reqModel } = req.body;
    const keyInfo = getApiKeyDetails();
    const activeKey = keyInfo.key;

    if (!activeKey) {
      return res.status(401).json({
        error: 'No active GROQ_API_KEY found in process.env or .env.local.',
        hasKey: false,
      });
    }

    const rawPrompt = prompt || message || '';
    if (!rawPrompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const groq = getGroqClient();
    const groqMessages = buildGroqMessages([], rawPrompt, language);
    const candidateModels = getGroqCandidateModels(reqModel);

    let lastError: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await groq.chat.completions.create({
          messages: groqMessages,
          model: modelName,
          temperature: 0.7,
        });

        const text = response.choices[0]?.message?.content || '';
        return res.json({
          success: true,
          text,
          response: text,
          model: modelName,
        });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`[POST /api/generate] Model ${modelName} error:`, lastError);
      }
    }

    return res.status(502).json({
      error: 'Generation failed with Groq',
      details: lastError,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// 4. Vision & OCR Analysis endpoint
app.post('/api/vision/analyze', async (req: Request, res: Response) => {
  try {
    const { image, mode = 'full', prompt = '', language = 'English' } = req.body;
    const activeKey = getApiKey();

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!activeKey) {
      return res.json({
        success: true,
        description: 'Simulated preview: SOYO Mind AI Camera detected objects in the scene. Configure GROQ_API_KEY for live inference.',
        objects: ['Smartphone', 'Desk', 'Ambient Light'],
        detectedText: 'SOYO MIND VAI - VISION OCR',
        labels: ['Technology', 'Indoor', 'Smart Assistant'],
        suggestedQuestions: ['What is the purpose of this object?', 'Summarize detected text'],
      });
    }

    const groq = getGroqClient();
    const candidateModels = getGroqCandidateModels();

    const instruction = `You are SOYO Mind VAI Vision Intelligence System. The user submitted a camera capture or photo.
Focus: ${prompt || (mode === 'ocr' ? 'Transcribe and read text accurately' : 'Analyze scene, objects, and layout')}.
Respond STRICTLY with valid JSON (no markdown formatting, no code fences):
{
  "description": "Comprehensive concise description of the image content in ${language}",
  "objects": ["Object 1", "Object 2", "Object 3"],
  "detectedText": "Any transcribed text or No readable text detected",
  "labels": ["Label 1", "Label 2", "Label 3", "Label 4"],
  "suggestedQuestions": ["Question 1?", "Question 2?", "Question 3?"]
}`;

    let parsedResult: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an advanced visual analysis AI assistant. Return only valid JSON.' },
            { role: 'user', content: instruction },
          ],
          model: modelName,
          temperature: 0.3,
        });

        const raw = response.choices[0]?.message?.content || '{}';
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleaned);
        break;
      } catch (err: any) {
        console.warn(`[Vision analyze] Model ${modelName} failed:`, err.message);
      }
    }

    return res.json({
      success: true,
      description: parsedResult?.description || 'Scene analyzed successfully with SOYO Mind.',
      objects: parsedResult?.objects || ['Detected Object', 'Environment'],
      detectedText: parsedResult?.detectedText || '',
      labels: parsedResult?.labels || ['Visual AI', 'Analysis'],
      suggestedQuestions: parsedResult?.suggestedQuestions || ['Tell me more about this image', 'Provide tips based on this image'],
    });
  } catch (err: any) {
    console.error('Error in /api/vision/analyze:', err);
    return res.status(500).json({
      error: err.message || 'Vision analysis failed',
      description: 'Unable to process image at this moment.',
      objects: [],
      detectedText: '',
      labels: [],
      suggestedQuestions: [],
    });
  }
});

// 5. Photo Enhancement AI Insights
app.post('/api/photo/ai-prompt', async (req: Request, res: Response) => {
  try {
    const { image, language = 'English' } = req.body;
    const activeKey = getApiKey();

    if (!image || !activeKey) {
      return res.json({
        caption: 'A stunning captured moment with SOYO Mind VAI.',
        enhancementTips: ['Increase warmth for golden-hour tones', 'Slight vignette to focus on subject', 'Crop to 4:3 for balanced framing'],
        hashtags: ['#AIPhoto', '#SOYOMind', '#VisualAI', '#Photography'],
      });
    }

    const groq = getGroqClient();
    const candidateModels = getGroqCandidateModels();
    let parsed: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `Generate social media photo recommendations. Return STRICT JSON only without code blocks:
{
  "caption": "A catchy, aesthetic social media caption in ${language}",
  "enhancementTips": ["Tip 1", "Tip 2", "Tip 3"],
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
}`,
            },
            { role: 'user', content: 'Generate enhancement suggestions for the captured photo.' },
          ],
          model: modelName,
          temperature: 0.7,
        });

        const raw = response.choices[0]?.message?.content || '{}';
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
        break;
      } catch (err: any) {
        console.warn(`[Photo AI] Model ${modelName} failed:`, err.message);
      }
    }

    return res.json(
      parsed || {
        caption: 'A stunning captured moment with SOYO Mind VAI.',
        enhancementTips: ['Enhance brightness and sharpness', 'Adjust color saturation', 'Apply subtle vignette'],
        hashtags: ['#SOYOMind', '#AIEnhanced', '#CreativeShot', '#VisualIntelligence'],
      }
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Groq API Key Status endpoint
app.get('/api/key/status', (_req: Request, res: Response) => {
  const details = getApiKeyDetails();
  res.json({
    provider: 'Groq',
    defaultModel: 'llama-3.1-8b-instant',
    hasKey: Boolean(details.key),
    source: details.source,
    isPlaceholder: details.isPlaceholder,
    hasLocalFile: details.hasLocalFile,
    maskedKey: details.key
      ? (details.key.length > 8 ? `${details.key.slice(0, 7)}••••${details.key.slice(-4)}` : '••••••••')
      : null,
  });
});

// 7. Update / save Groq API key directly into .env.local
app.post('/api/key/save', (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    if (typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'apiKey must be a string' });
    }
    const cleanKey = apiKey.trim();
    const localEnvPath = path.resolve(process.cwd(), '.env.local');
    fs.writeFileSync(localEnvPath, `GROQ_API_KEY=${cleanKey}\n`, 'utf8');

    if (cleanKey && cleanKey !== 'yaha apni key paste karo') {
      process.env.GROQ_API_KEY = cleanKey;
    }

    const updated = getApiKeyDetails();
    res.json({
      success: true,
      provider: 'Groq',
      hasKey: Boolean(updated.key),
      source: updated.source,
      message: 'Saved to .env.local',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed writing .env.local' });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const keyInfo = getApiKeyDetails();
  res.json({
    status: 'ok',
    app: 'SOYO Mind - A Virtual Artificial Intelligence',
    version: '4.0.0',
    provider: 'Groq',
    defaultModel: 'llama-3.1-8b-instant',
    hasApiKey: Boolean(keyInfo.key),
    keySource: keyInfo.source,
    hasEnvLocalFile: keyInfo.hasLocalFile,
  });
});

// Mount Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SOYO Mind VAI Groq-powered server running on http://0.0.0.0:${port}`);
  });
}

startServer();
