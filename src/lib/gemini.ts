// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCRl4TwbB9qXdtRkSn1ddah-4WcLcaWKYk';

if (!API_KEY) {
  console.error('Gemini API key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  async generateResponse(
    message: string, 
    imageBase64?: string, 
    conversationHistory: any[] = []
  ): Promise<string> {
    try {
      // Prepare the current message parts
      const parts: any[] = [];
      
      if (message.trim()) {
        parts.push({ text: message });
      }

      if (imageBase64) {
        // Remove the data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: this.getMimeTypeFromBase64(imageBase64),
            data: base64Data,
          },
        });
      }

      // For chat with history, use chat session
      if (conversationHistory.length > 0) {
        const chat = this.model.startChat({
          history: conversationHistory,
        });
        
        const result = await chat.sendMessage(parts);
        return result.response.text();
      } else {
        // For single message or first message
        const result = await this.model.generateContent(parts);
        return result.response.text();
      }
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      
      // Provide helpful error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('Invalid API key. Please check your Gemini API key configuration.');
        } else if (error.message.includes('quota')) {
          throw new Error('API quota exceeded. Please try again later.');
        } else if (error.message.includes('safety')) {
          throw new Error('Content filtered by safety settings. Please try rephrasing your message.');
        }
      }
      
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async generateStreamResponse(
    message: string,
    imageBase64?: string,
    conversationHistory: any[] = [],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const parts: any[] = [];
      
      if (message.trim()) {
        parts.push({ text: message });
      }

      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: this.getMimeTypeFromBase64(imageBase64),
            data: base64Data,
          },
        });
      }

      let fullResponse = '';

      if (conversationHistory.length > 0) {
        const chat = this.model.startChat({
          history: conversationHistory,
        });
        
        const result = await chat.sendMessageStream(parts);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          onChunk?.(chunkText);
        }
      } else {
        const result = await this.model.generateContentStream(parts);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          onChunk?.(chunkText);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error generating streaming Gemini response:', error);
      throw new Error('Failed to generate streaming response. Please try again.');
    }
  }

  private getMimeTypeFromBase64(base64String: string): string {
    if (base64String.startsWith('data:image/jpeg') || base64String.includes('/9j/')) {
      return 'image/jpeg';
    } else if (base64String.startsWith('data:image/png') || base64String.includes('iVBOR')) {
      return 'image/png';
    } else if (base64String.startsWith('data:image/webp')) {
      return 'image/webp';
    } else if (base64String.startsWith('data:image/gif')) {
      return 'image/gif';
    }
    // Default to JPEG if we can't determine
    return 'image/jpeg';
  }

  // Convert internal message format to Gemini format for history
  convertToGeminiHistory(messages: Array<{ content: string; isUser: boolean; image?: string }>): any[] {
    return messages.map(msg => {
      const parts: any[] = [];
      
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      
      if (msg.image && msg.isUser) {
        parts.push({
          inlineData: {
            mimeType: this.getMimeTypeFromBase64(msg.image),
            data: msg.image.replace(/^data:image\/[^;]+;base64,/, ''),
          },
        });
      }
      
      return {
        role: msg.isUser ? 'user' : 'model',
        parts,
      };
    });
  }
}

export const geminiService = new GeminiService();