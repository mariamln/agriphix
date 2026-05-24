import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@/lib/firebase';

async function uploadFile({ file }) {
  if (!file) throw new Error('No file provided');
  const user = auth.currentUser;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `uploads/${user?.uid || 'anonymous'}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const file_url = await getDownloadURL(storageRef);
  return { file_url };
}

function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(candidate);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function buildGeminiParts(prompt, file_urls) {
  const parts = [{ text: prompt }];

  if (!file_urls?.length) return parts;

  for (const url of file_urls.slice(0, 2)) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) continue;
      const base64 = arrayBufferToBase64(await blob.arrayBuffer());
      parts.push({
        inline_data: {
          mime_type: blob.type,
          data: base64,
        },
      });
    } catch (err) {
      console.warn('[Agriphix] Could not attach image for LLM:', url, err);
    }
  }

  return parts;
}

/**
 * @typedef {Object} InvokeLLMOptions
 * @property {string} prompt
 * @property {object} [response_json_schema]
 * @property {string[]} [file_urls]
 */

async function invokeGemini({ prompt, response_json_schema, file_urls }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const parts = await buildGeminiParts(prompt, file_urls);
  const body = {
    contents: [{ parts }],
    generationConfig: response_json_schema
      ? { responseMimeType: 'application/json' }
      : undefined,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (response_json_schema) {
    return extractJson(text);
  }
  return text;
}

function halalFallbackAnalysis(prompt) {
  const methodMatch = prompt.match(/Farming Method: ([^\n]+)/);
  const method = methodMatch?.[1]?.toLowerCase() ?? 'conventional';
  const organic = method.includes('organic');
  const score = organic ? 82 : 68;
  return {
    halal_score: score,
    compliance_status: score >= 75 ? 'compliant' : 'needs_review',
    summary: organic
      ? 'Organic practices align well with halal agriculture principles. Documentation could be strengthened.'
      : 'Conventional inputs require review for halal compliance. Consider organic alternatives where possible.',
    violations: organic ? [] : ['Review synthetic inputs for haram derivatives'],
    recommendations: ['Maintain input records', 'Document water and soil treatment sources'],
    criteria_scores: {
      chemical_safety: organic ? 85 : 60,
      water_source: 75,
      soil_treatment: organic ? 80 : 65,
      farming_method: organic ? 90 : 55,
      animal_byproducts: 70,
      documentation: 65,
    },
  };
}

function financeFallbackSuggestion() {
  return {
    instrument: 'Murabaha',
    structure: 'Cost-plus financing for agricultural inputs with transparent markup and fixed repayment schedule.',
    rationale: 'Murabaha suits asset-backed farm financing under Shari\'ah principles.',
  };
}

/**
 * @param {InvokeLLMOptions} options
 */
async function invokeLLM({ prompt, response_json_schema, file_urls }) {
  try {
    const gemini = await invokeGemini({ prompt, response_json_schema, file_urls });
    if (gemini) return gemini;
  } catch (err) {
    console.warn('[Agriphix] LLM request failed:', err);
  }

  if (response_json_schema) {
    if (prompt.includes('Halal Compliance Report') || prompt.includes('SHARI\'AH COMPLIANCE')) {
      return halalFallbackAnalysis(prompt);
    }
    if (prompt.includes('Islamic finance instrument')) {
      return financeFallbackSuggestion();
    }
    return {};
  }

  return 'Configure VITE_GEMINI_API_KEY for live AI responses. This is a placeholder advisory response for development.';
}

export const firebaseIntegrations = {
  Core: {
    UploadFile: uploadFile,
    InvokeLLM: /** @type {(options: InvokeLLMOptions) => Promise<any>} */ (invokeLLM),
    SendEmail: async () => {
      throw new Error('Email integration not configured');
    },
    SendSMS: async () => {
      throw new Error('SMS integration not configured');
    },
    GenerateImage: async () => {
      throw new Error('Image generation not configured');
    },
    ExtractDataFromUploadedFile: async () => {
      throw new Error('File extraction not configured');
    },
  },
};
