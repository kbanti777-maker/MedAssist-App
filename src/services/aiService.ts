export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  mapsPlaces?: GroundedPlace[];
}

export interface GroundedPlace {
  title: string;
  uri: string;
  address?: string;
  reviewSnippets?: string[];
}

export interface TriageAssessmentResult {
  severity: 'CRITICAL' | 'URGENT' | 'MODERATE' | 'LOW';
  severityColor: 'red' | 'orange' | 'yellow' | 'green';
  summary: string;
  redFlags: string[];
  immediateActions: string[];
  contraindications: string[];
  recommendedFacility: string;
  timeframe: string;
  vitalSignsToMonitor?: string[];
}

export type ChatbotRole = 'fast_triage' | 'general_advisor' | 'complex_analysis';

export interface ChatbotConfig {
  role: ChatbotRole;
  title: string;
  modelAlias: string;
  modelName: string;
  description: string;
  systemInstruction: string;
}

export const CHATBOT_ROLES: Record<ChatbotRole, ChatbotConfig> = {
  fast_triage: {
    role: 'fast_triage',
    title: 'Fast Emergency Triage',
    modelAlias: 'gemini-3.1-flash-lite',
    modelName: 'gemini-3.1-flash-lite',
    description: 'High-speed instant symptom triage, emergency severity prioritization, and immediate red-flag warnings.',
    systemInstruction: `You are MedAssist Fast Triage, an emergency response AI powered by gemini-3.1-flash-lite.
Your objective is MAXIMUM SPEED and CONCISE, ACCURATE safety prioritization.
1. Immediately classify the severity: Critical (Code Red - 911 immediately), Urgent (Code Yellow - ER/Urgent Care within 1 hour), or Non-Emergency (Code Green - Clinic/Doctor).
2. Give 2-3 immediate protective actions (e.g. sit upright, apply firm pressure, do not give water).
3. If red flags are detected (unconsciousness, crushing chest pain, anaphylaxis, severe breathing difficulty), immediately tell the user to dial 911 without hesitation.`,
  },
  general_advisor: {
    role: 'general_advisor',
    title: 'Clinical Emergency Advisor',
    modelAlias: 'gemini-3.8-flash',
    modelName: 'gemini-3.8-flash',
    description: 'Comprehensive medical triage, first aid step-by-step guidance, burn/injury management, and hospital navigation.',
    systemInstruction: `You are MedAssist Clinical Advisor, an emergency medical assistant powered by gemini-3.8-flash.
You provide clear, empathetic, evidence-based triage and first aid guidance for patients, caregivers, and first aiders.
Structure your advice logically:
- Immediate Safety Assessment
- Step-by-Step Recommended First Aid Action
- Critical "What NOT to Do" Warnings
- When to Seek Emergency Hospitalization
Maintain a calm, professional healthcare demeanor. Always remind users that you provide guidance to support, but never replace, licensed emergency medical services.`,
  },
  complex_analysis: {
    role: 'complex_analysis',
    title: 'Complex Clinical Case Analysis',
    modelAlias: 'gemini-3.1-pro-preview',
    modelName: 'gemini-3.1-pro-preview',
    description: 'Deep clinical reasoning, multi-symptom presentations, contraindications, and drug-drug/allergy cross-checks.',
    systemInstruction: `You are MedAssist Clinical Specialist, an advanced medical reasoning AI powered by gemini-3.1-pro-preview.
Your task is deep diagnostic analysis, evaluating multi-symptom clinical presentations, reviewing pre-existing conditions, cross-checking allergies and medications against reported symptoms, and evaluating acute risks.
Provide detailed differential reasoning, potential pathology considerations, contraindication warnings, and high-priority clinical follow-up recommendations. Emphasize patient safety at all times.`,
  },
};

export const AiService = {
  async sendChatMessage(
    messages: { role: 'user' | 'model'; content: string }[],
    role: ChatbotRole,
    userLocation?: { latitude: number; longitude: number; address?: string }
  ): Promise<{ reply: string; modelUsed: string }> {
    const config = CHATBOT_ROLES[role];
    let modeParam = 'general';
    if (role === 'fast_triage') modeParam = 'fast';
    if (role === 'complex_analysis') modeParam = 'complex';

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        systemInstruction: config.systemInstruction,
        mode: modeParam,
        userLocation,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply,
      modelUsed: data.modelUsed || config.modelName,
    };
  },

  async queryMapsGrounding(
    query: string,
    location?: { latitude: number; longitude: number; address?: string }
  ): Promise<{ text: string; places: GroundedPlace[] }> {
    const response = await fetch('/api/ai/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        location,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Maps grounding error (${response.status})`);
    }

    return await response.json();
  },

  async performTriageAssessment(payload: {
    symptoms: string;
    patientAge?: number;
    medicalHistory?: string[];
    currentMedications?: string[];
    allergies?: string[];
  }): Promise<TriageAssessmentResult> {
    const response = await fetch('/api/ai/triage-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to complete AI triage assessment.');
    }

    const data = await response.json();
    return data.assessment;
  },

  async generateSpeechAudio(text: string, voiceName: string = 'Kore'): Promise<string> {
    const response = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate voice audio.');
    }

    const data = await response.json();
    return data.audioBase64;
  },
};

