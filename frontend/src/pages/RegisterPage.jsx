import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none";

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center px-4">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-10">PrepAI</Link>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-slate-400 mt-1 text-sm">Start preparing for your dream job</p>
          </div>

          {[
            { label: 'Full Name', name: 'name', type: 'text', icon: User, placeholder: 'John Doe' },
            { label: 'Email', name: 'email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
            { label: 'Password', name: 'password', type: 'password', icon: Lock, placeholder: '••••••••' },
            { label: 'Confirm Password', name: 'confirmPassword', type: 'password', icon: ShieldCheck, placeholder: '••••••••' },
          ].map(({ label, name, type, icon: Icon, placeholder }) => (
            <div key={name} className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={type} name={name} value={form[name]} onChange={handleChange}
                  placeholder={placeholder} className={inputClass} />
              </div>
              {errors[name] && <p className="text-xs text-red-400 mt-1">{errors[name]}</p>}
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
          </button>

          <p className="text-center mt-6 text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
