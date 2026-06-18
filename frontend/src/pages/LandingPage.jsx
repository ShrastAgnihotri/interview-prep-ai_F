import { Link } from 'react-router-dom';
import { Brain, Target, AlertTriangle, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Gemini AI analyzes your resume against job descriptions to identify strengths and gaps.' },
  { icon: Target, title: 'Technical Prep', desc: 'Get tailored technical interview questions with detailed expected answers.' },
  { icon: AlertTriangle, title: 'Skill Gap Detection', desc: 'Pinpoint skill gaps with severity ratings and actionable recommendations.' },
  { icon: CalendarDays, title: '7-Day Roadmap', desc: 'A structured daily preparation plan with tasks and resources.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">PrepAI</Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white">Sign In</Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Ace Your Next <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Interview</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          AI-powered interview preparation that analyzes your resume against job descriptions to generate personalized technical questions, behavioral strategies, and a 7-day preparation roadmap.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Everything You Need to Prepare</h2>
        <p className="text-slate-400 text-center mb-14">Comprehensive AI-driven tools for interview success.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl p-6 border border-white/10 bg-white/5 hover:border-indigo-500/30 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Interview?</h2>
        <p className="text-slate-400 mb-8">Start preparing with AI-powered insights today.</p>
        <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} PrepAI. Built with Google Gemini AI.</p>
      </footer>
    </div>
  );
}
