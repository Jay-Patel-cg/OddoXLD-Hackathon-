if (!process.env.GEMINI_API_KEY) {
  try {
    require('dotenv').config();
  } catch (e) { }
}

const { GoogleGenAI } = require('@google/genai');

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
 * Generate text response using Google Gemini API
 * @param {string} prompt - Prompt string for Gemini model
 * @param {object} options - Optional parameters (model, temperature, etc.)
 * @returns {Promise<{text: string, model: string}>}
 */
const generateText = async (prompt, options = {}) => {
  try {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      const error = new Error('Prompt string is required');
      error.status = 400;
      throw error;
    }

    const ai = getClient();
    const model = (options.model || getModelName()).trim();

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
    if (error.status && error.isConfigError) {
      throw error;
    }

    const status = error.status || 500;
    const safeMessage = error.message && error.message.includes('API key')
      ? 'Gemini AI service authentication failed'
      : (error.message || 'Error communicating with Gemini AI service');

    const err = new Error(safeMessage);
    err.status = status;
    throw err;
  }
};

/**
 * Generate structured JSON response using Google Gemini API
 * @param {string} prompt - Prompt string for Gemini model
 * @param {object} options - Optional parameters (model, responseSchema, etc.)
 * @returns {Promise<{data: object, model: string}>}
 */
const generateJSON = async (prompt, options = {}) => {
  try {
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
    try {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedData = JSON.parse(cleanText);
    } catch (parseErr) {
      const error = new Error('Failed to parse Gemini response as JSON');
      error.status = 502;
      throw error;
    }

    return {
      data: parsedData,
      model
    };
  } catch (error) {
    if (error.status && error.isConfigError) {
      throw error;
    }

    const status = error.status || 500;
    const safeMessage = error.message && error.message.includes('API key')
      ? 'Gemini AI service authentication failed'
      : (error.message || 'Error communicating with Gemini AI service');

    const err = new Error(safeMessage);
    err.status = status;
    throw err;
  }
};

module.exports = {
  getApiKey,
  getModelName,
  generateText,
  generateJSON
};
