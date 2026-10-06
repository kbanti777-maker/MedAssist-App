import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AiService,
  ChatMessage,
  ChatbotRole,
  CHATBOT_ROLES,
  TriageAssessmentResult,
} from '../../services/aiService';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  Stethoscope,
  Brain,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Volume2,
  Square,
  Activity,
  AlertOctagon,
  Building2,
  PhoneCall,
  Clock,
} from 'lucide-react';

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    medicalProfile,
    userLocation,
    showToast,
    setCurrentPage,
    initiateDemoCall,
  } = useApp();

  // Mode: 'chat' or 'triage_grader'
  const [activeTab, setActiveTab] = useState<'chat' | 'triage_grader'>('chat');
  const [activeRole, setActiveRole] = useState<ChatbotRole>('general_advisor');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Hello! I am MedAssist AI, your emergency clinical triage advisor.

How can I help evaluate your symptoms or assist with emergency first aid today?
Select **Fast Triage** for instant severity grading, **Clinical Advisor** for detailed first aid steps, or **Complex Analysis** to evaluate multi-symptom interactions with your medical profile.`,
      timestamp: 'Just now',
      modelUsed: CHATBOT_ROLES.general_advisor.modelName,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice AI playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Triage grader state
  const [triageSymptomsInput, setTriageSymptomsInput] = useState('');
  const [isGradingTriage, setIsGradingTriage] = useState(false);
  const [triageAssessment, setTriageAssessment] = useState<TriageAssessmentResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, activeTab]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentRoleConfig = CHATBOT_ROLES[activeRole];

  const handlePlayVoice = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingMessageId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    setIsLoadingTTS(msgId);
    setPlayingMessageId(msgId);

    try {
      // Use clean text for speech
      const cleanText = text.replace(/[*_#`]/g, '').slice(0, 350);
      const audioBase64 = await AiService.generateSpeechAudio(cleanText, 'Kore');
      const audioUrl = `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setPlayingMessageId(null);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        showToast('Audio Error', 'Failed to play voice message.', 'error');
        setPlayingMessageId(null);
      };

      await audio.play();
    } catch (err: any) {
      console.error('TTS error:', err);
      showToast('Voice Unavailable', err.message || 'Could not synthesize audio.', 'error');
      setPlayingMessageId(null);
    } finally {
      setIsLoadingTTS(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await AiService.sendChatMessage(
        historyPayload,
        activeRole,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          address: userLocation.address,
        }
      );

      const aiReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Error generating triage analysis: ${err?.message || 'Server timeout'}. 
If you or anyone nearby is experiencing a life-threatening crisis, do not wait—please dial 911 or visit the nearest emergency department immediately.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      showToast('Chat Request Error', 'Failed to communicate with Gemini API.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachContext = () => {
    const contextSnippet = `[PATIENT MEDICAL CONTEXT: Full Name: ${medicalProfile.fullName}, Age: ${medicalProfile.age}, Blood Group: ${medicalProfile.bloodGroup}, Allergies: ${medicalProfile.allergies.join(', ') || 'None'}, Existing Conditions: ${medicalProfile.existingConditions.join(', ') || 'None'}, Current Medications: ${medicalProfile.currentMedications.join(', ') || 'None'}, Location: ${userLocation.address}]. Please cross-reference my medical history with the following question: `;
    setInputMessage((prev) => contextSnippet + prev);
    showToast('Medical ID Attached', 'Your profile allergies, medications & location added to chat prompt.', 'info');
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Conversation refreshed. Currently set to **${currentRoleConfig.title}** (${currentRoleConfig.modelName}). How can I assist you?`,
        timestamp: 'Just now',
        modelUsed: currentRoleConfig.modelName,
      },
    ]);
    showToast('Conversation Cleared', 'Chat history reset.', 'info');
  };

  const handleRunStructuredTriage = async (symptomsToRun?: string) => {
    const symptoms = symptomsToRun || triageSymptomsInput;
    if (!symptoms.trim() || isGradingTriage) return;

    setIsGradingTriage(true);
    setTriageAssessment(null);

    try {
      const assessment = await AiService.performTriageAssessment({
        symptoms: symptoms.trim(),
        patientAge: medicalProfile.age,
        medicalHistory: medicalProfile.existingConditions,
        currentMedications: medicalProfile.currentMedications,
        allergies: medicalProfile.allergies,
      });

      setTriageAssessment(assessment);
      showToast('Triage Assessment Complete', `Severity Graded: ${assessment.severity}`, 'info');
    } catch (err: any) {
      console.error('Triage assessment failed:', err);
      showToast('Assessment Error', err.message || 'Could not complete triage.', 'error');
    } finally {
      setIsGradingTriage(false);
    }
  };

  const quickPrompts = [
    'Assess crushing chest pain & shortness of breath',
    'Severe allergic reaction with swelling and hives',
    'Child fell, hit head, vomiting once',
    'Check drug interactions with Lisinopril',
    'Deep bleeding laceration: what to do right now',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[850px] animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">MedAssist AI Clinical Suite</h3>
                <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md border border-teal-500/30">
                  {currentRoleConfig.modelName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Clinical Symptom Grading · Emergency Voice Guidance · Red-Flag Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'chat' && (
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                title="Clear chat history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Chat vs Structured Triage Grader */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 Multi-Turn Clinical Chat
            </button>
            <button
              onClick={() => setActiveTab('triage_grader')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'triage_grader'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-teal-800 hover:bg-teal-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>⚡ Structured Triage Grader</span>
            </button>
          </div>

          {activeTab === 'chat' && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Mode: {currentRoleConfig.title}
            </span>
          )}
        </div>

        {/* ========================================================
            TAB 1: MULTI-TURN CHATBOT
            ======================================================== */}
        {activeTab === 'chat' && (
          <>
            {/* 3 Model Role Switcher Tabs */}
            <div className="bg-slate-50 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveRole('fast_triage')}
                className={`flex-1 min-w-[170px] p-2 rounded-2xl text-left transition-all border ${
                  activeRole === 'fast_triage'
                    ? 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-400/40'
                    : 'border-transparent hover:bg-white/60 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Fast Triage</span>
                  </span>
                  <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    gemini-3.1-flash-lite
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">Immediate priority & red flags</p>
              </button>

              <button
                onClick={() => setActiveRole('general_advisor')}
                className={`flex-1 min-w-[170px] p-2 rounded-2xl text-left transition-all border ${
                  activeRole === 'general_advisor'
                    ? 'bg-white border-teal-400 shadow-xs ring-1 ring-teal-500/40'
                    : 'border-transparent hover:bg-white/60 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>Clinical Advisor</span>
                  </span>
                  <span className="text-[9px] font-mono bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded font-bold">
                    gemini-3.8-flash
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">General triage & first aid</p>
              </button>

              <button
                onClick={() => setActiveRole('complex_analysis')}
                className={`flex-1 min-w-[170px] p-2 rounded-2xl text-left transition-all border ${
                  activeRole === 'complex_analysis'
                    ? 'bg-white border-purple-400 shadow-xs ring-1 ring-purple-500/40'
                    : 'border-transparent hover:bg-white/60 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>Complex Analysis</span>
                  </span>
                  <span className="text-[9px] font-mono bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                    gemini-3.1-pro-preview
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">Multi-symptom & drug interactions</p>
              </button>
            </div>

            {/* Emergency Warning Bar */}
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="leading-snug">
                  <strong>Emergency Warning: </strong> If suffering from acute crushing chest pain, severe bleeding, or unconsciousness, dial <strong>911</strong> immediately.
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-700 hidden md:inline shrink-0 font-bold">
                TRIAGE ASSISTANT
              </span>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                        isUser ? 'bg-slate-800' : 'bg-teal-700 shadow-sm'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-teal-700 text-white rounded-tr-sm shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-xs'
                      }`}
                    >
                      {!isUser && msg.modelUsed && (
                        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 text-[10px] font-mono text-slate-400">
                          <span className="font-bold text-teal-700 uppercase">MedAssist Triage</span>
                          <span>{msg.modelUsed}</span>
                        </div>
                      )}

                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Read Aloud Button for AI Advice */}
                      {!isUser && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handlePlayVoice(msg.id, msg.content)}
                            className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
                            title="Listen to emergency voice instructions hands-free"
                          >
                            {isLoadingTTS === msg.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                            ) : playingMessageId === msg.id ? (
                              <>
                                <Square className="w-3 h-3 fill-current text-teal-700" />
                                <span>Stop Voice Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-teal-600" />
                                <span>Read Aloud (Voice AI)</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] font-mono text-slate-400">
                            {msg.timestamp}
                          </span>
                        </div>
                      )}

                      {isUser && (
                        <div className="text-[10px] mt-2 font-mono text-teal-200 text-right">
                          {msg.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-sm p-4 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                    <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                    <span>Evaluating clinical symptoms with {currentRoleConfig.modelName}...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Suggested:
              </span>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Bottom Input Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleAttachContext}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                  title="Attach Medical Profile & Allergies"
                >
                  <Paperclip className="w-4 h-4 text-teal-600" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Describe acute symptoms or ask first aid question...`}
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* ========================================================
            TAB 2: STRUCTURED TRIAGE & RED-FLAG GRADER
            ======================================================== */}
        {activeTab === 'triage_grader' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50">
            {/* Intro Header */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    AI Clinical Severity Grader
                  </h4>
                  <p className="text-xs text-slate-500">
                    Evaluates acute presentation against pre-existing conditions ({medicalProfile.existingConditions.join(', ') || 'None'}) and known allergies ({medicalProfile.allergies.join(', ') || 'None'}).
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Describe Patient Symptoms or Acute Emergency Event
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={triageSymptomsInput}
                    onChange={(e) => setTriageSymptomsInput(e.target.value)}
                    placeholder="e.g. 58-year-old male with sudden tight pressure in chest radiating to left shoulder, sweating profusely, mild nausea for 20 minutes."
                    className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>

                {/* Quick Symptom Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Crushing chest pressure radiating to left jaw',
                    'Severe sudden difficulty breathing / wheezing',
                    'Child 104°F fever with neck stiffness',
                    'Deep bleeding laceration from kitchen blade',
                    'Sudden facial droop and right arm weakness',
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setTriageSymptomsInput(s);
                        handleRunStructuredTriage(s);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Powered by gemini-3.8-flash triage model
                  </span>
                  <button
                    onClick={() => handleRunStructuredTriage()}
                    disabled={!triageSymptomsInput.trim() || isGradingTriage}
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                  >
                    {isGradingTriage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Grading Severity...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze & Grade Severity</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Assessment Result Card */}
            {triageAssessment && (
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-5 animate-in fade-in-50 duration-200">
                {/* Header with Severity Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                          triageAssessment.severity === 'CRITICAL'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : triageAssessment.severity === 'URGENT'
                            ? 'bg-amber-500 text-white'
                            : triageAssessment.severity === 'MODERATE'
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'bg-emerald-100 text-emerald-900 font-bold'
                        }`}
                      >
                        {triageAssessment.severity} SEVERITY
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {triageAssessment.timeframe}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-2">
                      {triageAssessment.summary}
                    </h3>
                  </div>

                  <button
                    onClick={() =>
                      handlePlayVoice(
                        'triage-voice',
                        `${triageAssessment.severity} priority. ${triageAssessment.summary}. Immediate steps: ${triageAssessment.immediateActions.join('. ')}`
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <Volume2 className="w-4 h-4 text-teal-600" />
                    <span>Read Assessment Aloud</span>
                  </button>
                </div>

                {/* Red Flags Alert */}
                {triageAssessment.redFlags && triageAssessment.redFlags.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>RED FLAG SYMPTOMS DETECTED</span>
                    </div>
                    <ul className="text-xs text-rose-900 space-y-1 pl-4 list-disc">
                      {triageAssessment.redFlags.map((flag, idx) => (
                        <li key={idx} className="font-semibold">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2-Column Grid: Immediate Actions vs Contraindications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Immediate Actions */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Immediate Protective Steps</span>
                    </h5>
                    <ol className="text-xs text-slate-800 space-y-2">
                      {triageAssessment.immediateActions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-teal-700 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Contraindications */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Contraindications ("What NOT to do")</span>
                    </h5>
                    <ul className="text-xs text-amber-900 space-y-1.5">
                      {triageAssessment.contraindications.map((contra, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold shrink-0">✕</span>
                          <span>{contra}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Care Facility & Direct Navigation */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block">
                      Recommended Level of Care
                    </span>
                    <h4 className="text-base font-bold mt-0.5">
                      {triageAssessment.recommendedFacility}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Urgency: {triageAssessment.timeframe}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        setCurrentPage('hospitals');
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Open Live Hospital Radar Map</span>
                    </button>

                    {triageAssessment.severity === 'CRITICAL' && (
                      <button
                        onClick={() => initiateDemoCall('Emergency Dispatch', '911')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Dial 911</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
