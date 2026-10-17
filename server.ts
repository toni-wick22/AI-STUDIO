import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction for Professor Cue
const SYSTEM_INSTRUCTION = `You are "Professor Cue", an elite billiards geometry instructor, physics coach, and master cue theorist.
Your expertise is in explaining:
- Shot geometry (ghost-ball contact point, cut angles, aiming lines)
- Ball dynamics (90-degree stun tangent line rule, 30-degree rolling follow rule, draw backspin deflection)
- Cushion physics (bank shot mirror system, kick shot geometry, incidence vs reflection, rail compression, cut-induced throw)
- Safety strategy, positional planning, and table layout analysis.

Always be encouraging, precise, and educational. Explain the geometry with clean geometrical intuition (fractions, angles, diamond systems).
When the user shares table coordinates or asks about a shot setup, break down:
1. Target line & ghost-ball alignment
2. Cut angle & difficulty rating
3. Tangent line deflection path for the cue ball
4. Potential kiss balls or scratch hazards.`;

// Multi-turn chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'gemini-3.8-flash', tableContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Supported models based on user choice:
    // gemini-4-argon for complex tasks, gemini-3.8-flash for general, gemini-3.1-flash-lite for fast
    const validModel = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].includes(model)
      ? model
      : 'gemini-3.8-flash';

    // Format contents
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If tableContext is present, inject as instruction or prepend to the latest query
    let systemInstruction = SYSTEM_INSTRUCTION;
    if (tableContext) {
      systemInstruction += `\n\n[Active Table Setup Data]:
- Shot Type: ${tableContext.shotType || 'Direct'}
- Cue Ball Pos: (${tableContext.cuePos?.x.toFixed(1)}, ${tableContext.cuePos?.y.toFixed(1)})
- Target Ball Pos: (${tableContext.targetPos?.x.toFixed(1)}, ${tableContext.targetPos?.y.toFixed(1)})
- Target Pocket: ${tableContext.pocketName || 'Corner Pocket'}
- Calculated Cut Angle: ${tableContext.cutAngle ? tableContext.cutAngle.toFixed(1) + '°' : 'N/A'}
- Ball Hit Fraction: ${tableContext.fraction || 'N/A'}
- Path Obstructed: ${tableContext.isBlocked ? 'YES (Deflection/Ghost path blocked)' : 'NO (Clear)'}`;
    }

    const response = await ai.models.generateContent({
      model: validModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "I've analyzed the shot geometry. Keep your cue level and follow through smoothly.";
    return res.json({ text: responseText, model: validModel });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from Professor Cue',
    });
  }
});

// Text-to-Speech endpoint using gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', style = 'Encouraging, articulate billiards coach' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required' });
    }

    // Limit text length for TTS snippet
    const sanitizedText = text.slice(0, 800);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: sanitizedText,
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // Puck, Kore, Fenrir, Zephyr, Charon
          },
        },
      },
    });

    // Unary default returns complete WAV file in inlineData.data
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned by TTS model' });
    }

    return res.json({ audioBase64: base64Audio, format: 'audio/wav' });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize speech',
    });
  }
});

// Image Diagram Generation using gemini-3-pro-image-preview / gemini-nano-banana-2.1 with 1K, 2K, 4K resolution
app.post('/api/generate-diagram', async (req: Request, res: Response) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '16:9' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const enhancedPrompt = `Technical billiards shot diagram, top-down isometric educational illustration of a pool table: ${prompt}. Clean green baize cloth, crisp white aim lines, yellow target line, ghost ball ring, precision angles, professional sports diagram style.`;

    const validSize = ['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';
    const validAspect = ['16:9', '4:3', '1:1'].includes(aspectRatio) ? aspectRatio : '16:9';

    // Model selection based on instruction: gemini-3-pro-image-preview or gemini-nano-banana-2.1
    let modelName = 'gemini-nano-banana-2.1';
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspect,
            imageSize: validSize as '1K' | '2K' | '4K',
          },
        },
      });

      let imageUrl: string | null = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('No image part in generation response');
      }

      return res.json({ imageUrl, size: validSize, prompt: enhancedPrompt });
    } catch (genError: any) {
      // Fallback to gemini-3.1-flash-lite-image if high-res model is unavailable
      console.warn('High-res image generation fallback:', genError.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
      });

      let fallbackUrl: string | null = null;
      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            fallbackUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (fallbackUrl) {
        return res.json({ imageUrl: fallbackUrl, size: 'Standard (Fallback)', prompt: enhancedPrompt });
      }
      throw genError;
    }
  } catch (error: any) {
    console.error('Diagram generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate shot diagram',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Cue Geometry Trainer', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
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
    console.log(`Cue Geometry Trainer server running on http://0.0.0.0:${port}`);
  });
}

startServer();
