import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_FIRST_AID_GUIDES } from '../services/mockData';
import { AiService } from '../services/aiService';
import {
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  Activity,
  Wind,
  Bandage,
  Sun,
  UserX,
  PhoneCall,
  Volume2,
  Square,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const FirstAidPage: React.FC = () => {
  const { openSOSModal, initiateDemoCall, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('fa-cpr');

  // AI Voice playback state
  const [activeAudioGuideId, setActiveAudioGuideId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoiceGuide = async (guide: typeof INITIAL_FIRST_AID_GUIDES[0], e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing this guide, stop it
    if (activeAudioGuideId === guide.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setActiveAudioGuideId(null);
      return;
    }

    // Stop any existing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsLoadingAudio(true);
    setActiveAudioGuideId(guide.id);

    try {
      // Compose clear, spoken first-aid prompt
      const spokenScript = `Emergency first aid for ${guide.title}. Priority is ${guide.severityLevel}. First: ${guide.steps.slice(0, 3).join('. Next: ')}. Warning: ${guide.whatNotToDo[0] || 'Remain calm'}.`;
      
      const audioBase64 = await AiService.generateSpeechAudio(spokenScript, 'Kore');
      const audioUrl = `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setActiveAudioGuideId(null);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        showToast('Audio Playback Error', 'Could not play voice guidance.', 'error');
        setActiveAudioGuideId(null);
        currentAudioRef.current = null;
      };

      await audio.play();
      showToast('AI Voice Playing', `Speaking guidance for ${guide.title}.`, 'info');
    } catch (err: any) {
      console.error('Audio guidance error:', err);
      showToast('Voice Error', err.message || 'Failed to synthesize speech.', 'error');
      setActiveAudioGuideId(null);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Protocols' },
    { id: 'CPR Basics', label: 'CPR & Cardiac' },
    { id: 'Choking', label: 'Choking' },
    { id: 'Cuts & Bleeding', label: 'Bleeding & Hemorrhage' },
    { id: 'Burns', label: 'Burns' },
    { id: 'Fainting', label: 'Fainting & Syncope' },
    { id: 'Sprains & Fractures', label: 'Sprains & Fractures' },
    { id: 'Heat Illness', label: 'Heat Stroke / Exhaustion' },
  ];

  const filteredGuides = useMemo(() => {
    return INITIAL_FIRST_AID_GUIDES.filter((guide) => {
      const matchesSearch =
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ? true : guide.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Clinical First-Response Guidance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            First Aid & Emergency Guidance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standardized protocols with critical "What NOT to do" warnings and hospital escalation thresholds.
          </p>
        </div>

        <button
          onClick={() => openSOSModal()}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4 fill-current" />
          <span>Need Urgent Help? Trigger SOS</span>
        </button>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4.5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Medical Disclaimer: </strong>
          This information is for general educational purposes and does not replace professional medical care, diagnosis, or immediate paramedic treatment. Always call emergency dispatch (911/112) for life-threatening conditions.
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms or procedures (e.g. CPR compressions, burn ice, choking thrusts)..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Accordion List */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => {
          const isExpanded = expandedId === guide.id;

          let severityBadge = 'bg-slate-100 text-slate-700';
          if (guide.severityLevel === 'Critical') {
            severityBadge = 'bg-rose-100 text-rose-800 border border-rose-200';
          } else if (guide.severityLevel === 'Moderate') {
            severityBadge = 'bg-amber-100 text-amber-800 border border-amber-200';
          }

          return (
            <div
              key={guide.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                isExpanded ? 'border-teal-500 shadow-md ring-1 ring-teal-500/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Toggle */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                className="w-full p-5 text-left flex items-start justify-between gap-4 focus:outline-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${severityBadge}`}>
                      {guide.severityLevel} Priority
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-teal-700">{guide.category}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {guide.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handlePlayVoiceGuide(guide, e)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeAudioGuideId === guide.id
                        ? 'bg-teal-700 text-white animate-pulse'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                    }`}
                    title={activeAudioGuideId === guide.id ? 'Stop Voice Guidance' : 'Play AI Voice Audio (Hands-Free)'}
                  >
                    {isLoadingAudio && activeAudioGuideId === guide.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    ) : activeAudioGuideId === guide.id ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline text-[11px]">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                        <span className="hidden sm:inline text-[11px]">Voice AI</span>
                      </>
                    )}
                  </button>

                  <div className="p-2 rounded-xl bg-slate-50 text-slate-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Expanded Content with 3 Key Sections */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 space-y-6 animate-in fade-in-50 duration-150">
                  {/* 1. What To Do (Steps) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>What To Do (Step-by-Step Instructions)</span>
                    </h4>
                    <ol className="space-y-2 text-xs text-slate-700">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 2. What NOT To Do (Warnings) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>What NOT To Do (Critical Safety Hazards)</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-rose-900">
                      {guide.whatNotToDo.map((warn, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                          <span className="text-rose-600 font-bold shrink-0">✕</span>
                          <span className="leading-relaxed">{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. When To Seek Professional Help */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>When To Seek Emergency Care / Red Flags</span>
                    </h4>
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 space-y-1 text-xs text-amber-900">
                      {guide.whenToSeekHelp.map((flag, idx) => (
                        <p key={idx} className="leading-relaxed">
                          • {flag}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Quick Action Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      If symptoms escalate or patient loses alertness:
                    </span>
                    <button
                      onClick={() => initiateDemoCall('Paramedic Triage (911)', '911')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Emergency Dispatch (911)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
