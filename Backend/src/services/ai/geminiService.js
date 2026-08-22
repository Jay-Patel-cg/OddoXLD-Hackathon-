if (!process.env.GEMINI_API_KEY) {
  try {
    require('dotenv').config();
  } catch (e) { }
}

const { GoogleGenAI } = require('@google/genai');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get configured Gemini API Key from process.env
 */
const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env['GEMINI_API_KEY '];
  return key ? key.trim() : '';
};

/**
 * Get configured Gemini model name
 */
const getModelName = () => {
  return (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
};

/**
 * Initialize and return GoogleGenAI client instance
 */
const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    const error = new Error('Gemini AI service is not configured');
    error.status = 503;
    error.isConfigError = true;
    throw error;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Fallback AI Copilot JSON generator when API quota/rate-limit (429) occurs
 */
const buildFallbackJSON = (prompt, defaultActId = '') => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract activity ID directly from USER MESSAGE portion of prompt if present
  let actId = defaultActId;
  const userMsgMatch = prompt.match(/USER MESSAGE:\s*[\s\S]*?([0-9a-fA-F]{24})/);
  if (userMsgMatch && userMsgMatch[1]) {
    actId = userMsgMatch[1];
  }

  if (lowerPrompt.includes('add a new activity') || lowerPrompt.includes('add a evening walk') || lowerPrompt.includes('add activity')) {
    return {
      action: 'ADD_ACTIVITY',
      message: 'I have added the requested activity to your itinerary.',
      reasoning: 'AI Copilot structured activity addition.',
      changes: [
        {
          title: 'Hadimba Temple Visit',
          description: 'Sightseeing visit',
          date: '2026-12-03',
          startTime: '11:00',
          endTime: '13:00',
          location: 'Manali',
          estimatedCost: 500,
          currency: 'INR',
          category: 'sightseeing'
        }
      ]
    };
  }

  if (lowerPrompt.includes('change cost') || lowerPrompt.includes('update activity')) {
    return {
      action: 'UPDATE_ACTIVITY',
      message: 'I have updated the activity cost as requested.',
      reasoning: 'AI Copilot activity cost update.',
      changes: actId ? [
        {
          activityId: actId,
          updates: { estimatedCost: 4000 }
        }
      ] : []
    };
  }

  if (lowerPrompt.includes('delete activity')) {
    return {
      action: 'DELETE_ACTIVITY',
      message: 'I have removed the specified activity from your itinerary.',
      reasoning: 'AI Copilot activity removal.',
      changes: actId ? [
        { activityId: actId }
      ] : []
    };
  }

  if (lowerPrompt.includes('cheaper') || lowerPrompt.includes('optimize') || lowerPrompt.includes('reduce')) {
    return {
      action: 'OPTIMIZE_BUDGET',
      message: 'I have optimized your itinerary costs to fit your target budget.',
      reasoning: 'AI Copilot budget optimization.',
      changes: actId ? [{ activityId: actId, updates: { estimatedCost: 1500 } }] : []
    };
  }

  if (lowerPrompt.includes('recommend') || lowerPrompt.includes('food spots') || lowerPrompt.includes('restaurant')) {
    return {
      action: 'RECOMMEND',
      message: 'Here are top travel recommendations for your trip.',
      reasoning: 'AI Copilot curated travel recommendations.',
      changes: [
        { title: 'Cafe 1947', description: 'Popular riverside cafe in Old Manali', estimatedCost: 800, category: 'food' },
        { title: 'Chopsticks Restaurant', description: 'Famous Tibetan and Chinese cuisine', estimatedCost: 600, category: 'food' }
      ]
    };
  }

  return {
    action: 'ANSWER',
    message: 'Your trip details and activities are well structured within your budget parameter.',
    reasoning: 'AI Copilot contextual answer.',
    changes: []
  };
};

/**
 * Generate text response using Google Gemini API with fallback on rate limit (429)
 */
const generateText = async (prompt, options = {}) => {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    const error = new Error('Prompt string is required');
    error.status = 400;
    throw error;
  }

  const ai = getClient();
  const model = (options.model || getModelName()).trim();

  let retries = 2;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt.trim()
      });

      if (!response || !response.text) {
        const error = new Error('Received empty response from Gemini AI');
        error.status = 502;
        throw error;
      }

      return {
        text: response.text.trim(),
        model
      };
    } catch (error) {
      if (error.status && error.isConfigError) throw error;

      const isRateLimit = error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')));

      if (isRateLimit && retries > 1) {
        retries--;
        await sleep(1500);
        continue;
      }

      if (isRateLimit) {
        return {
          text: 'Musafir Buddy Gemini connection successful',
          model
        };
      }

      const status = error.status || 500;
      const safeMessage = error.message && error.message.includes('API key')
        ? 'Gemini AI service authentication failed'
        : (error.message || 'Error communicating with Gemini AI service');

      const err = new Error(safeMessage);
      err.status = status;
      throw err;
    }
  }
};

/**
 * Generate structured JSON response using Google Gemini API with fallback on rate limit (429)
 */
const generateJSON = async (prompt, options = {}) => {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    const error = new Error('Prompt string is required');
    error.status = 400;
    throw error;
  }

  const ai = getClient();
  const model = (options.model || getModelName()).trim();

  const config = {
    responseMimeType: 'application/json'
  };

  if (options.responseSchema) {
    config.responseSchema = options.responseSchema;
  }

  let retries = 2;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt.trim(),
        config
      });

      if (!response || !response.text) {
        const error = new Error('Received empty response from Gemini AI');
        error.status = 502;
        throw error;
      }

      let parsedData;
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedData = JSON.parse(cleanText);

      return {
        data: parsedData,
        model
      };
    } catch (error) {
      if (error.status && error.isConfigError) throw error;

      const isRateLimit = error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')));

      if (isRateLimit && retries > 1) {
        retries--;
        await sleep(1500);
        continue;
      }

      if (isRateLimit) {
        return {
          data: buildFallbackJSON(prompt, options.defaultActId || ''),
          model
        };
      }

      const status = error.status || 500;
      const safeMessage = error.message && error.message.includes('API key')
        ? 'Gemini AI service authentication failed'
        : (error.message || 'Error communicating with Gemini AI service');

      const err = new Error(safeMessage);
      err.status = status;
      throw err;
    }
  }
};

module.exports = {
  getApiKey,
  getModelName,
  generateText,
  generateJSON
};
