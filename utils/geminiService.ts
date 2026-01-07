import { useCurriculumStore } from '@/store/curriculumStore';

interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

interface GeminiResponse {
  text: string;
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
}

class GeminiService {
  private apiKey: string;
  private model: string;
  private maxRetries: number;
  private timeout: number;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private rateLimitPerMinute: number = 10; // 10 requests per minute per user

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime > 60000) {
      // Reset counter every minute
      this.requestCount = 0;
    }
    
    if (this.requestCount >= this.rateLimitPerMinute) {
      return false;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
    return true;
  }

  private async callGeminiAPI(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<GeminiResponse> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait a minute before making more requests.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 500,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text;
        return { text, candidates: data.candidates };
      } else {
        throw new Error('No valid response from Gemini API');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out after 30 seconds');
      }
      throw error;
    }
  }

  async generateResponseWithFallback(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.callGeminiAPI(prompt, options);
        
        // Validate response
        if (result.text.trim().length === 0) {
          throw new Error('Empty response from Gemini API');
        }
        
        if (result.text.length > 5000) {
          throw new Error('Response too long (exceeds 5000 characters)');
        }
        
        return result.text;
      } catch (error) {
        if (attempt === this.maxRetries - 1) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error('Failed to get response after all retries');
  }

  async generateEducationalResponse(query: string, context?: {
    concept?: string;
    topic?: string;
    chapter?: string;
    subject?: string;
    class?: string;
  }, language: 'en' | 'hi' = 'en'): Promise<string> {
    let systemPrompt = `You are Smarty, an AI learning assistant for LearnSmart educational app. 
You help students with their questions in a friendly, educational manner. 
Always provide accurate, helpful, and age-appropriate explanations. 
Respond in ${language === 'hi' ? 'Hindi' : 'English'}.

Your responses should be:
1. Clear and easy to understand for students
2. Educational and helpful
3. Encouraging and positive
4. Accurate and factual
5. Age-appropriate for school students (Classes 1-10)`;

    if (context && (context.concept || context.topic || context.chapter)) {
      systemPrompt += `\n\n Context: The student is currently learning about ${context.concept || context.topic || context.chapter}`;
      if (context.chapter) systemPrompt += ` in ${context.chapter}`;
      if (context.subject) systemPrompt += ` (${context.subject})`;
      if (context.class) systemPrompt += ` for Class ${context.class}`;
    }

    const prompt = `${systemPrompt}\n\n Student: ${query}\n\n Smarty: Please provide a helpful, educational response (max 300 words).`;

    try {
      const response = await this.generateResponseWithFallback(prompt, { maxTokens: 300, temperature: 0.7 });
      return response;
    } catch (error) {
      console.error('Gemini service error:', error);
      throw new Error('Unable to generate response. Please try again later.');
    }
  }

  async explainConcept(concept: string, topic?: string, chapter?: string): Promise<string> {
    const prompt = `Explain the concept of "${concept}" in simple terms for a school student. 
    ${topic ? `This is part of the topic: ${topic}. ` : ''}
    ${chapter ? `The chapter is: ${chapter}. ` : ''}
    Make it engaging, use examples if helpful, and keep it concise (150-200 words).
    Use bullet points for clarity where appropriate.`;

    return await this.generateResponseWithFallback(prompt, { maxTokens: 300, temperature: 0.6 });
  }

  async generatePracticeQuestion(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    const prompt = `Generate a practice question about ${topic} for a school student.
    Difficulty: ${difficulty}
    Include:
    - The question
    - Multiple choice options (if appropriate) or open-ended question
    - The correct answer
    - A brief explanation of why it's correct
    
    Format it clearly with labels for each part. Keep it educational and engaging. Maximum 150 words total.`;

    return await this.generateResponseWithFallback(prompt, { maxTokens: 250, temperature: 0.7 });
  }

  async provideMotivation(studentName?: string): Promise<string> {
    const prompt = `Provide an encouraging, motivational message for a student using the LearnSmart app.
    ${studentName ? `The student's name is ${studentName}. ` : ''}
    Make it warm, encouraging, and positive. Keep it to 2-3 sentences. Use emojis sparingly.`;

    return await this.generateResponseWithFallback(prompt, { maxTokens: 100, temperature: 0.8 });
  }

  async generateHomework(subject: string, topic: string, difficulty: string, count: number, classLevel: string): Promise<string> {
    const prompt = `You are an expert homework writer for ${subject} at ${classLevel} level.
Write ${count} problems for ${topic} at ${difficulty} level.

IMPORTANT REQUIREMENTS:
1. Write like a human teacher, not AI. Use natural language.
2. Include clear problem statements
3. Add "Given" and "Find" sections for math/physics
4. Provide COMPLETE SOLUTIONS with step-by-step explanations
5. Add helpful tips/shortcuts where applicable
6. Format nicely with:
   - Problem number and heading
   - Clear diagram descriptions (if needed)
   - Solution with all steps shown
   - Final answer highlighted
7. No obvious AI signs. Make it look like a real homework sheet.
8. Include real-world examples/applications
9. Add 1-2 follow-up questions for deeper learning

Output format should be clear, professional, printable.`;

    return await this.generateResponseWithFallback(prompt, { maxTokens: 1500, temperature: 0.7 });
  }
}

// Create singleton instance
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyA_52KzCCKd5vEkuxZotT3CCCgTkWIoJ8I';

if (!API_KEY) {
  console.warn('EXPO_PUBLIC_GEMINI_API_KEY not found in environment. Using fallback key.');
}

export const geminiService = new GeminiService({
  apiKey: API_KEY,
  model: 'gemini-1.5-flash',
  maxRetries: 3,
  timeout: 30000,
});

export const generateHomeworkWithGemini = (subject: string, topic: string, difficulty: string, count: number, classLevel: string) => 
  geminiService.generateHomework(subject, topic, difficulty, count, classLevel);
