const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const sendChatMessage = async (
  messages: ChatMessage[],
  model: string = 'deepseek/deepseek-chat-v3-0324:free'
): Promise<string | null> => {
  if (!OPENROUTER_API_KEY) {
    console.warn('OpenRouter API key not configured - AI chat disabled');
    return null;
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'EduLearn Platform',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`OpenRouter API error: ${response.status}`, errorData);
      return null;
    }

    const data: ChatResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    return null;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return null;
  }
};

export const generateEducationalResponse = async (
  userMessage: string,
  subject: string,
  context?: string
): Promise<string | null> => {
  const systemPrompt = `You are an expert AI tutor specializing in ${subject}. Your role is to:

1. Provide clear, accurate, and educational explanations
2. Break down complex concepts into understandable parts
3. Use examples and analogies when helpful
4. Encourage critical thinking and learning
5. Be patient and supportive
6. Adapt your language to the student's level

${context ? `Context: ${context}` : ''}

Always maintain a friendly, encouraging tone and focus on helping the student understand the material deeply.`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return await sendChatMessage(messages);
};

export const generateVideoAnalysis = async (
  videoTitle: string,
  videoDescription: string,
  subject: string
): Promise<string | null> => {
  const systemPrompt = `You are an AI educational assistant. Analyze the given video content and provide:

1. Key learning objectives
2. Main concepts covered
3. Suggested follow-up questions for students
4. Related topics to explore
5. Difficulty level assessment

Be concise but comprehensive in your analysis.`;

  const userMessage = `Please analyze this educational video:

Title: ${videoTitle}
Subject: ${subject}
Description: ${videoDescription}

Provide a helpful analysis for students who are about to watch or have just watched this video.`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return await sendChatMessage(messages);
};

export const generateStudyPlan = async (
  subject: string,
  currentLevel: string,
  goals: string
): Promise<string | null> => {
  const systemPrompt = `You are an AI educational planner. Create personalized study plans that are:

1. Realistic and achievable
2. Progressive in difficulty
3. Include diverse learning methods
4. Have clear milestones
5. Adaptable to different learning styles

Format your response with clear sections and actionable steps.`;

  const userMessage = `Create a study plan for:

Subject: ${subject}
Current Level: ${currentLevel}
Goals: ${goals}

Please provide a structured plan with timeline, key topics, and learning strategies.`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return await sendChatMessage(messages);
};

// Available models on OpenRouter
export const availableModels = [
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek Chat V3 (Free)',
    description: 'Advanced reasoning and coding capabilities',
    provider: 'DeepSeek',
    free: true,
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B (Free)',
    description: 'Fast and efficient for general tasks',
    provider: 'Meta',
    free: true,
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini (Free)',
    description: 'Compact model optimized for reasoning',
    provider: 'Microsoft',
    free: true,
  },
];

export const isOpenRouterAvailable = (): boolean => {
  return !!OPENROUTER_API_KEY;
};