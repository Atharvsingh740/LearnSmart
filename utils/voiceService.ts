import { Platform } from 'react-native';
import { useState, useEffect } from 'react';

// Voice recognition state interface
export interface VoiceRecognitionState {
  isRecording: boolean;
  transcript: string;
  hasError: boolean;
  error?: string;
  isSupported: boolean;
  isAuthorized: boolean;
}

// Text-to-speech state interface
export interface TextToSpeechState {
  isSpeaking: boolean;
  currentRate: number;
  currentLanguage: string;
  isAvailable: boolean;
}

// Voice service configuration
export interface VoiceServiceConfig {
  speechRate: number; // 0.5 - 2.0
  language: string; // 'en-US', 'hi-IN', etc.
  autoStopTimeout: number; // milliseconds, 0 for no auto-stop
  requireNetwork: boolean;
  enablePartialResults: boolean;
}

// Default configuration
export const DEFAULT_VOICE_CONFIG: VoiceServiceConfig = {
  speechRate: 1.0,
  language: 'en-US',
  autoStopTimeout: 30000, // 30 seconds
  requireNetwork: true,
  enablePartialResults: true,
};

// Voice Service Class
class VoiceService {
  private config: VoiceServiceConfig;
  private recognition: any = null;
  private tts: any = null;
  private isInitialized = false;
  private recognitionCallbacks = {
    onResult: (result: string) => {},
    onError: (error: string) => {},
    onEnd: () => {},
    onStart: () => {},
  };

  constructor(config: VoiceServiceConfig = DEFAULT_VOICE_CONFIG) {
    this.config = { ...DEFAULT_VOICE_CONFIG, ...config };
    this.initializeServices();
  }

  async initializeServices() {
    try {
      // Initialize Speech Recognition (mock implementation)
      // In a real app, this would use react-native-voice or similar
      this.recognition = {
        isAvailable: true,
        isAuthorized: true,
        isRecording: false,
        start: () => this.startRecognition(),
        stop: () => this.stopRecognition(),
        destroy: () => this.destroyRecognition(),
      };

      // Initialize Text-to-Speech (mock implementation)
      // In a real app, this would use react-native-tts
      this.tts = {
        isAvailable: true,
        isSpeaking: false,
        currentRate: this.config.speechRate,
        supportedLanguages: ['en-US', 'en-GB', 'hi-IN', 'es-ES', 'fr-FR'],
        speak: (text: string, options?: object) => this.startTTS(text, options),
        stop: () => this.stopTTS(),
        setRate: (rate: number) => this.setTTSSpeechRate(rate),
        setLanguage: (language: string) => this.setTTSLanguage(language),
      };

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize voice services:', error);
      this.isInitialized = false;
    }
  }

  // Speech Recognition Methods
  async startRecognition(options?: {
    language?: string;
    timeout?: number;
    onPartialResult?: (text: string) => void;
  }) {
    if (!this.recognition?.isAvailable) {
      throw new Error('Speech recognition not available');
    }

    const language = options?.language || this.config.language;
    const timeout = options?.timeout || this.config.autoStopTimeout;

    try {
      // Mock recognition - in real app would start native recognition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.recognition.isRecording = true;
      this.recognitionCallbacks.onStart?.();

      // Mock auto-stop after timeout
      if (timeout > 0) {
        setTimeout(() => {
          if (this.recognition.isRecording) {
            this.stopRecognition();
          }
        }, timeout);
      }

      // Simulate recognition process
      this.simulateRecognition();

    } catch (error) {
      this.recognitionCallbacks.onError?.(error.message);
      throw error;
    }
  }

  async stopRecognition() {
    if (!this.recognition?.isRecording) return;

    this.recognition.isRecording = false;
    const transcript = this.generateMockTranscript();
    this.recognitionCallbacks.onResult?.(transcript);
    this.recognitionCallbacks.onEnd?.();
  }

  async destroyRecognition() {
    if (this.recognition) {
      this.recognition = null;
    }
  }

  private simulateRecognition() {
    // Simulate real-time recognition updates
    const mockPhrases = [
      "Hello,",
      "Hello, I",
      "Hello, I want",
      "Hello, I want to",
      "Hello, I want to learn",
      "Hello, I want to learn about",
      "Hello, I want to learn about physics",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (!this.recognition.isRecording) {
        clearInterval(interval);
        return;
      }

      if (index < mockPhrases.length) {
        this.recognitionCallbacks.onPartialResult?.(mockPhrases[index]);
      }
      index++;
    }, 800);
  }

  private generateMockTranscript(): string {
    const mockTranscripts = [
      "Hello, I want to learn about Newton's laws of motion",
      "Explain the concept of gravity in simple terms",
      "What is the difference between kinetic and potential energy",
      "Help me understand chemical bonding",
      "Can you solve a quadratic equation?",
      "Explain photosynthesis in detail",
    ];
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
  }

  // Text-to-Speech Methods
  async startTTS(text: string, options?: {
    rate?: number;
    language?: string;
    onStart?: () => void;
    onDone?: () => void;
    onError?: (error: string) => void;
  }) {
    if (!this.tts?.isAvailable) {
      throw new Error('Text-to-speech not available');
    }

    const rate = options?.rate || this.config.speechRate;
    const language = options?.language || this.config.language;

    return new Promise<void>((resolve, reject) => {
      try {
        this.tts.isSpeaking = true;
        options?.onStart?.();

        // Mock TTS completion
        const wordCount = text.split(' ').length;
        const duration = (wordCount / 150) * 60 * 1000 / rate; // Approximate duration

        setTimeout(() => {
          this.tts.isSpeaking = false;
          options?.onDone?.();
          resolve();
        }, duration);

      } catch (error) {
        this.tts.isSpeaking = false;
        options?.onError?.(error.message);
        reject(error);
      }
    });
  }

  async stopTTS() {
    if (!this.tts?.isSpeaking) return;

    this.tts.isSpeaking = false;
    // In real implementation, would stop native TTS
  }

  async setTTSSpeechRate(rate: number) {
    if (!this.tts) return;

    this.config.speechRate = rate;
    this.tts.currentRate = rate;
  }

  async setTTSLanguage(language: string) {
    if (!this.tts) return;

    this.config.language = language;
    this.tts.currentLanguage = language;
  }

  // Configuration Methods
  async updateConfig(updates: Partial<VoiceServiceConfig>) {
    this.config = { ...this.config, ...updates };
    
    if (updates.speechRate && this.tts) {
      await this.setTTSSpeechRate(updates.speechRate);
    }
    if (updates.language) {
      await this.setTTSLanguage(updates.language);
    }
  }

  getConfig(): VoiceServiceConfig {
    return { ...this.config };
  }

  // Helper Methods
  isRecognitionAvailable(): boolean {
    return this.recognition?.isAvailable || false;
  }

  isTTSAvailable(): boolean {
    return this.tts?.isAvailable || false;
  }

  isRecording(): boolean {
    return this.recognition?.isRecording || false;
  }

  isSpeaking(): boolean {
    return this.tts?.isSpeaking || false;
  }

  // Set recognition callbacks
  setRecognitionCallbacks(callbacks: {
    onResult?: (result: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    onStart?: () => void;
  }) {
    this.recognitionCallbacks = {
      ...this.recognitionCallbacks,
      ...callbacks,
    };
  }

  // Support checks
  async supportsLanguage(language: string): Promise<boolean> {
    if (!this.tts) return false;
    return this.tts.supportedLanguages?.includes(language) || false;
  }

  async checkPermissions(): Promise<{
    speech: boolean;
    microphone: boolean;
  }> {
    // In real app, would check native permissions
    return {
      speech: true,
      microphone: true,
    };
  }

  async requestPermissions(): Promise<{
    speech: boolean;
    microphone: boolean;
  }> {
    // In real app, would request native permissions
    return {
      speech: true,
      microphone: true,
    };
  }
}

// Voice Service Hook for React components
export function useVoiceService(config?: Partial<VoiceServiceConfig>) {
  const [state, setState] = useState<{
    recognition: VoiceRecognitionState;
    tts: TextToSpeechState;
  }>({
    recognition: {
      isRecording: false,
      transcript: '',
      hasError: false,
      isSupported: false,
      isAuthorized: false,
    },
    tts: {
      isSpeaking: false,
      currentRate: config?.speechRate || 1.0,
      currentLanguage: config?.language || 'en-US',
      isAvailable: false,
    },
  });

  const [service] = useState(() => new VoiceService(config));

  useEffect(() => {
    // Initialize service
    service.initializeServices().then(() => {
      setState({
        recognition: {
          isRecording: false,
          transcript: '',
          hasError: false,
          isSupported: service.isRecognitionAvailable(),
          isAuthorized: true,
        },
        tts: {
          isSpeaking: false,
          currentRate: service.getConfig().speechRate,
          currentLanguage: service.getConfig().language,
          isAvailable: service.isTTSAvailable(),
        },
      });
    });

    // Set up callbacks
    service.setRecognitionCallbacks({
      onStart: () => {
        setState(prev => ({
          ...prev,
          recognition: {
            ...prev.recognition,
            isRecording: true,
          },
        }));
      },
      onEnd: () => {
        setState(prev => ({
          ...prev,
          recognition: {
            ...prev.recognition,
            isRecording: false,
          },
        }));
      },
      onResult: (text) => {
        setState(prev => ({
          ...prev,
          recognition: {
            ...prev.recognition,
            transcript: text,
          },
        }));
      },
      onError: (error) => {
        setState(prev => ({
          ...prev,
          recognition: {
            ...prev.recognition,
            hasError: true,
            error,
          },
        }));
      },
    });
  }, []);

  // Voice input methods
  const startVoiceInput = async (options?: Partial<VoiceServiceConfig>) => {
    try {
      setState(prev => ({
        ...prev,
        recognition: { ...prev.recognition, hasError: false, transcript: '' },
      }));

      await service.startRecognition(options);
    } catch (error) {
      setState(prev => ({
        ...prev,
        recognition: {
          ...prev.recognition,
          hasError: true,
          error: error.message,
        },
      }));
    }
  };

  const stopVoiceInput = async () => {
    await service.stopRecognition();
  };

  const handleVoiceToggle = async () => {
    if (state.recognition.isRecording) {
      await stopVoiceInput();
    } else {
      await startVoiceInput();
    }
  };

  // Text-to-speech methods
  const speakText = async (text: string, options?: {
    rate?: number;
    language?: string;
  }) => {
    try {
      setState(prev => ({
        ...prev,
        tts: { ...prev.tts, isSpeaking: true },
      }));

      await service.startTTS(text, {
        rate: options?.rate,
        language: options?.language,
        onDone: () => {
          setState(prev => ({
            ...prev,
            tts: { ...prev.tts, isSpeaking: false },
          }));
        },
        onError: (error) => {
          setState(prev => ({
            ...prev,
            tts: { ...prev.tts, isSpeaking: false },
          }));
          console.error('TTS Error:', error);
        },
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        tts: { ...prev.tts, isSpeaking: false },
      }));
      console.error('TTS Error:', error);
    }
  };

  const stopSpeaking = async () => {
    await service.stopTTS();
    setState(prev => ({
      ...prev,
      tts: { ...prev.tts, isSpeaking: false },
    }));
  };

  const adjustSpeechRate = async (rate: number) => {
    await service.setTTSSpeechRate(rate);
    setState(prev => ({
      ...prev,
      tts: { ...prev.tts, currentRate: rate },
    }));
  };

  const changeLanguage = async (language: string) => {
    await service.setTTSLanguage(language);
    setState(prev => ({
      ...prev,
      tts: { ...prev.tts, currentLanguage: language },
    }));
  };

  // Utility methods
  const clearTranscript = () => {
    setState(prev => ({
      ...prev,
      recognition: { ...prev.recognition, transcript: '' },
    }));
  };

  const clearError = () => {
    setState(prev => ({
      ...prev,
      recognition: { ...prev.recognition, hasError: false, error: undefined },
    }));
  };

  return {
    // State
    ...state,
    
    // Methods
    service,
    startVoiceInput,
    stopVoiceInput,
    handleVoiceToggle,
    speakText,
    stopSpeaking,
    adjustSpeechRate,
    changeLanguage,
    clearTranscript,
    clearError,
    
    // Convenience flags
    isRecording: state.recognition.isRecording,
    transcript: state.recognition.transcript,
    isSpeaking: state.tts.isSpeaking,
    speechRate: state.tts.currentRate,
    currentLanguage: state.tts.currentLanguage,
  };
}

// Export singleton instance
export const voiceService = new VoiceService();

// Language options
export const VOICE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

// Accent options for supported languages
export const ACCENT_OPTIONS = {
  'en-US': [
    { code: 'en-US', name: 'American' },
    { code: 'en-GB', name: 'British' },
    { code: 'en-AU', name: 'Australian' },
    { code: 'en-IN', name: 'Indian' },
  ],
  'hi-IN': [
    { code: 'hi-IN', name: 'Standard Hindi' },
    { code: 'hi-IN-regional', name: 'Regional Dialects' },
  ],
};

// Speech rate presets
export const SPEECH_RATE_PRESETS = [
  { rate: 0.5, label: '0.5x' },
  { rate: 0.75, label: '0.75x' },
  { rate: 1.0, label: 'Normal' },
  { rate: 1.25, label: '1.25x' },
  { rate: 1.5, label: '1.5x' },
  { rate: 1.75, label: '1.75x' },
  { rate: 2.0, label: '2x' },
];

// Audio format options
export const AUDIO_FORMAT_OPTIONS = [
  { format: 'opus', quality: 'High', size: 'Small' },
  { format: 'wav', quality: 'Lossless', size: 'Large' },
  { format: 'mp3', quality: 'Good', size: 'Medium' },
];

// Mock recognition for development
export const MOCK_VOICE_RECOGNITION = {
  isAvailable: true,
  isAuthorized: true,
  transcript: "This is a mock transcript from voice input",
  confidence: 0.95,
  alternatives: [
    "This is a mock transcript from voice input",
    "This is a test transcript from voice input",
    "This is a sample transcript from voice input",
  ],
};

// Voice quality metrics
export interface VoiceQualityMetrics {
  signalNoiseRatio: number; // dB
  recognitionConfidence: number; // 0-1
  latency: number; // ms
  accuracy: number; // percentage
}

// Mock metrics for development
export const MOCK_VOICE_METRICS: VoiceQualityMetrics = {
  signalNoiseRatio: 25.5,
  recognitionConfidence: 0.92,
  latency: 145,
  accuracy: 94.2,
};