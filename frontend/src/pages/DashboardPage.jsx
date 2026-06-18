import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Target, Calendar, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useInterview } from '../context/InterviewContext';

export default function DashboardPage() {
  const { interviews, isLoading, fetchInterviews, deleteInterview } = useInterview();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchInterviews(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteInterview(deleteId);
      toast.success('Interview deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const total = interviews.length;
  const avgScore = total > 0 ? Math.round(interviews.reduce((a, b) => a + (b.matchScore || 0), 0) / total) : 0;
  const latestDate = total > 0 ? new Date(interviews[0]?.createdAt).toLocaleDateString() : '—';

  // Helper for relative time
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Score color helper
  const scoreColor = (s) => s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Interviews</h1>
            <p className="text-sm text-slate-400 mt-1">Track and review your AI-powered analyses.</p>
          </div>
          <Link to="/interview/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm text-white">
            <Plus className="w-4 h-4" /> New Analysis
          </Link>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: <BarChart3 className="w-4 h-4 text-indigo-400" />, label: 'Total', value: total },
              { icon: <Target className="w-4 h-4 text-emerald-400" />, label: 'Avg Score', value: `${avgScore}%` },
              { icon: <Calendar className="w-4 h-4 text-violet-400" />, label: 'Latest', value: latestDate },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{s.icon}</div>
                <div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                  <div className="text-sm font-semibold text-white">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <BarChart3 className="w-9 h-9 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No interviews yet</h3>
            <p className="text-sm text-slate-400 mb-6">Start your first AI-powered interview analysis.</p>
            <Link to="/interview/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm text-white">
              <Plus className="w-4 h-4" /> New Analysis
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {interviews.map((interview) => (
              <div key={interview._id} className="rounded-xl border border-white/10 bg-[#111827] p-5 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{interview.jobTitle}</h3>
                    {interview.company && <p className="text-xs text-slate-400">{interview.company}</p>}
                  </div>
                  <span className={`text-lg font-bold ${scoreColor(interview.matchScore)}`}>
                    {interview.matchScore || 0}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{timeAgo(interview.createdAt)}</p>
                <div className="flex gap-2">
                  <Link to={`/interview/${interview._id}/report`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-xs font-medium">
                    <Eye className="w-3.5 h-3.5" /> View Report
                  </Link>
                  <button onClick={() => setDeleteId(interview._id)}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Interview</h3>
              <p className="text-sm text-slate-300 mb-6">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 rounded-lg disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
