import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Code2, ChevronDown, Users, Lightbulb, AlertTriangle, Map, CheckSquare, BookOpen, Target, HelpCircle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useInterview } from '../context/InterviewContext';
import api from '../api/axiosInstance';

// Score color helper
const getScoreTheme = (score) => {
  if (score >= 70) return { color: '#10b981', label: 'Strong Match', bg: 'from-emerald-600/20 to-emerald-900/10' };
  if (score >= 40) return { color: '#f59e0b', label: 'Moderate Match', bg: 'from-amber-600/20 to-amber-900/10' };
  return { color: '#ef4444', label: 'Needs Work', bg: 'from-red-600/20 to-red-900/10' };
};

const severityColors = { high: 'bg-red-500/10 text-red-400 border-red-500/20', medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20', low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
const difficultyColors = { easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20', hard: 'bg-red-500/10 text-red-400 border-red-500/20' };
const starStyles = [
  { label: 'Situation', border: 'border-indigo-500', bg: 'bg-indigo-500/5' },
  { label: 'Task', border: 'border-violet-500', bg: 'bg-violet-500/5' },
  { label: 'Action', border: 'border-purple-500', bg: 'bg-purple-500/5' },
  { label: 'Result', border: 'border-emerald-500', bg: 'bg-emerald-500/5' },
];

export default function ReportPage() {
  const { id } = useParams();
  const { currentInterview, isLoading, fetchInterviewById } = useInterview();
  const [expandedQ, setExpandedQ] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { fetchInterviewById(id); }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/interviews/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PrepAI-Report-${currentInterview?.jobTitle || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 pt-24 space-y-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!currentInterview) {
    return (
      <div className="min-h-screen bg-[#0b0f19]">
        <Navbar />
        <div className="text-center pt-32">
          <p className="text-slate-400 mb-4">Interview not found.</p>
          <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const ai = currentInterview.aiReport || {};
  const theme = getScoreTheme(currentInterview.matchScore || 0);
  const questions = ai.technicalQuestions || [];
  const strategies = ai.behavioralStrategies || [];
  const gaps = [...(ai.skillGapAnalysis || [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });
  const roadmap = ai.preparationRoadmap || [];

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-white">
              {currentInterview.jobTitle}
              {currentInterview.company && <span className="text-slate-400 font-normal"> at {currentInterview.company}</span>}
            </h1>
          </div>
          <button onClick={handleDownload} disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm text-white disabled:opacity-50">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* ========== MATCH SCORE BANNER ========== */}
        <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${theme.bg} p-6 md:p-8 mb-10`}>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="relative flex-shrink-0">
              <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
                <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="65" cy="65" r="52" fill="none" stroke={theme.color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 - ((currentInterview.matchScore || 0) / 100) * 2 * Math.PI * 52}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{currentInterview.matchScore || 0}%</span>
                <span className="text-xs text-slate-400">{theme.label}</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 justify-center md:justify-start">
                <Target className="w-5 h-5 text-indigo-400" /> Match Overview
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">{ai.executiveSummary}</p>
              <div className="flex flex-wrap gap-4 mt-5 justify-center md:justify-start">
                {[
                  { icon: <HelpCircle className="w-4 h-4" />, label: 'Questions', val: questions.length },
                  { icon: <AlertTriangle className="w-4 h-4" />, label: 'Skill Gaps', val: gaps.length },
                  { icon: <CalendarDays className="w-4 h-4" />, label: 'Roadmap Days', val: roadmap.length || 7 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-indigo-400">{s.icon}</span>
                    <span className="text-xs text-slate-400">{s.label}:</span>
                    <span className="text-sm font-semibold text-white">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========== TECHNICAL Q&A ========== */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Code2 className="w-5 h-5 text-indigo-400" /> Technical Q&A
            </h3>
            <span className="text-sm text-slate-400">{questions.length} Questions</span>
          </div>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#111827] overflow-hidden">
                <button onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white pr-2">{q.question}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${difficultyColors[q.difficulty] || ''}`}>{q.difficulty}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{q.topic}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedQ === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedQ === i && (
                  <div className="px-4 pb-4 pt-1 ml-10 border-t border-white/5">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Expected Answer</p>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{q.expectedAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========== BEHAVIORAL STRATEGIES ========== */}
        <div className="mb-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Users className="w-5 h-5 text-indigo-400" /> Behavioral Strategies
          </h3>
          <div className="space-y-4">
            {strategies.map((s, i) => (
              <div key={i} className={`rounded-xl border border-white/10 p-5 ${i % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0f1629]'}`}>
                <p className="text-sm font-semibold text-white mb-4">{s.question}</p>
                <div className="space-y-3">
                  {[s.situation, s.task, s.action, s.result].map((text, j) => (
                    <div key={j} className={`pl-3 border-l-2 ${starStyles[j].border} ${starStyles[j].bg} rounded-r-lg py-2 pr-3`}>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{starStyles[j].label}</span>
                      <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
                {s.tip && (
                  <div className="mt-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300/90">{s.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========== SKILL GAP ANALYSIS ========== */}
        <div className="mb-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <AlertTriangle className="w-5 h-5 text-indigo-400" /> Skill Gap Analysis
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {['high', 'medium', 'low'].map(sev => {
              const count = gaps.filter(g => g.severity === sev).length;
              return (
                <span key={sev} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${severityColors[sev]}`}>
                  <span className="font-bold">{count}</span> {sev === 'high' ? 'High Priority' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </span>
              );
            })}
          </div>
          <div className="space-y-3">
            {gaps.map((g, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#111827] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{g.skill}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${severityColors[g.severity]}`}>{g.severity}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1"><span className="text-slate-500">Current:</span> {g.currentLevel}</p>
                <p className="text-xs text-slate-300"><span className="text-indigo-400 font-medium">→</span> {g.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== PREPARATION ROADMAP ========== */}
        <div className="mb-10">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
            <Map className="w-5 h-5 text-indigo-400" /> 7-Day Preparation Roadmap
          </h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-violet-500/30 to-transparent" />
            <div className="space-y-6">
              {roadmap.map((day, i) => (
                <div key={i} className="relative pl-14">
                  <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center z-10">
                    <span className="text-sm font-bold text-indigo-400">{day.day}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
                    <h4 className="text-sm font-bold text-white mb-3">{day.focusArea}</h4>
                    {day.tasks?.length > 0 && (
                      <div className="mb-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-2">
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Tasks
                        </p>
                        <ul className="space-y-1.5">
                          {day.tasks.map((task, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {day.resources?.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-violet-400" /> Resources
                        </p>
                        <ul className="space-y-1">
                          {day.resources.map((res, j) => <li key={j} className="text-xs text-slate-400">{res}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
