const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
}

export const getAvailableVoices = async (): Promise<Voice[]> => {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return [];
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      console.warn(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.warn('ElevenLabs voices error:', error);
    return [];
  }
};

export const generateSpeech = async (text: string, voiceId: string): Promise<string | null> => {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured - speech generation disabled');
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`ElevenLabs speech generation failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.warn('ElevenLabs speech generation error:', error);
    return null;
  }
};

export const generateVideoSummary = async (videoTitle: string, description: string, voiceId?: string): Promise<string | null> => {
  const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella voice
  const selectedVoiceId = voiceId || defaultVoiceId;
  
  const summaryText = `This video, titled "${videoTitle}", provides ${
    description ? description.substring(0, 200) + '...' : 'educational content on this topic'
  }. Click play to start learning!`;

  return await generateSpeech(summaryText, selectedVoiceId);
};

export const generateNavigationAudio = async (instruction: string, voiceId?: string): Promise<string | null> => {
  const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella voice
  const selectedVoiceId = voiceId || defaultVoiceId;
  
  return await generateSpeech(instruction, selectedVoiceId);
};

// Pre-defined navigation instructions
export const navigationInstructions = {
  welcomeMessage: "Welcome to EduLearn! I'm here to help you navigate our educational platform. You can find free and premium content with AI-powered voice summaries.",
  filterBySubject: "To filter videos by subject, use the dropdown menu on the left sidebar or the filter options on the homepage.",
  premiumContent: "Premium content is marked with a crown icon. Subscribe to access exclusive courses and advanced tutorials.",
  uploadVideo: "Teachers can upload videos by clicking the upload button in the header. Set pricing for premium content if desired.",
  voiceFeatures: "Use the voice summary feature to get audio descriptions of video content before watching.",
};