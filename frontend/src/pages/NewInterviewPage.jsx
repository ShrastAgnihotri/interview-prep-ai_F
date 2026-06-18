import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Sparkles, Upload, FileText, X, Lightbulb, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useInterview } from '../context/InterviewContext';

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const { createInterview, isAnalyzing } = useInterview();

  const [form, setForm] = useState({ jobTitle: '', company: '', jobDescription: '', profileDescription: '' });
  const [resumeFile, setResumeFile] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) return toast.error('Only PDF files under 3MB allowed.');
    if (accepted.length > 0) setResumeFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 3 * 1024 * 1024,
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobTitle.trim()) return toast.error('Job title is required.');
    if (!form.jobDescription.trim()) return toast.error('Job description is required.');
    if (!resumeFile) return toast.error('Please upload your resume PDF.');

    const data = new FormData();
    data.append('jobTitle', form.jobTitle);
    data.append('company', form.company);
    data.append('jobDescription', form.jobDescription);
    data.append('profileDescription', form.profileDescription);
    data.append('resume', resumeFile);

    try {
      const result = await createInterview(data);
      toast.success('Analysis complete!');
      navigate(`/interview/${result._id}/report`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none";

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <Navbar />

      {/* Loading overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f19]/90 backdrop-blur-xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Analyzing with AI...</p>
            <p className="text-sm text-slate-400 mt-1">This takes 15-30 seconds</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-white mb-1">New Interview Analysis</h1>
        <p className="text-sm text-slate-400 mb-8">Provide the job details and your resume for AI-powered preparation.</p>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title</label>
                  <input name="jobTitle" value={form.jobTitle} onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
                  <input name="company" value={form.company} onChange={handleChange}
                    placeholder="e.g. Google (optional)" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Description</label>
                <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange}
                  placeholder="Paste the full job description here..."
                  rows={10} className={`${inputClass} resize-y min-h-[200px]`} />
                <p className="text-xs text-slate-500 mt-1 text-right">{form.jobDescription.length} chars</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Profile Description (optional)</label>
                <textarea name="profileDescription" value={form.profileDescription} onChange={handleChange}
                  placeholder="Tell us about your experience, career goals..."
                  rows={4} className={`${inputClass} resize-y`} />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Resume (PDF)</label>
                {!resumeFile ? (
                  <div {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/20 hover:border-indigo-500/50'}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">Drag & drop your resume PDF</p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse (max 3MB)</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-[#111827] p-4 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{resumeFile.name}</p>
                      <p className="text-xs text-slate-400">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={() => setResumeFile(null)} className="text-slate-400 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Tips for Best Results
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li>• Paste the <span className="text-slate-300">complete</span> job description</li>
                  <li>• Use a PDF with <span className="text-slate-300">selectable text</span></li>
                  <li>• Add profile context for <span className="text-slate-300">personalized</span> results</li>
                  <li>• Analysis takes <span className="text-slate-300">15–30 seconds</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button type="submit" disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-white disabled:opacity-50">
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
