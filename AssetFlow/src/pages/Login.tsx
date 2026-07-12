import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Shield, LogIn, Sparkles, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('admin@assetflow.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simple robust validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Simulate database lookup or hardcoded admin credentials
    setTimeout(() => {
      if (email === 'admin@assetflow.com' && password === 'admin') {
        localStorage.setItem('isAuthenticated', 'true');
        // Maintain scan parameter if present
        const scan = searchParams.get('scan');
        const redirectPath = scan === 'true' ? '/assets?scan=true' : '/';
        navigate(redirectPath);
      } else {
        setError('Invalid email or password. Use: admin@assetflow.com / admin');
        setLoading(false);
      }
    }, 800);
  };

  const handleQuickLogin = () => {
    setEmail('admin@assetflow.com');
    setPassword('admin');
    localStorage.setItem('isAuthenticated', 'true');
    const scan = searchParams.get('scan');
    const redirectPath = scan === 'true' ? '/assets?scan=true' : '/';
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto h-12 w-12 rounded-lg bg-[#714B67] flex items-center justify-center shadow-md mb-4">
          <img src="/logo-icon.svg" className="w-7 h-7 object-contain invert brightness-0" alt="af logo" />
        </div>
        <h2 className="text-2xl font-extrabold text-text tracking-tight">
          Sign in to AssetFlow
        </h2>
        <p className="mt-1.5 text-xs text-text-muted">
          Enterprise Asset & Digital Twin Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 border border-border-light rounded-lg shadow-sm sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2 animate-appear">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-premium w-full text-sm"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-premium w-full text-sm pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray hover:text-text cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-border-medium text-[#714B67] focus:ring-[#714B67] h-3.5 w-3.5"
                />
                <span>Remember this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Preset Box */}
          <div className="mt-6 pt-6 border-t border-border-light text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Hackathon Quick Access:
            </span>
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full btn-secondary py-2 px-4 text-xs font-bold bg-gray-50 border-border-light text-text hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles size={13} className="text-primary" />
              <span>One-Click Login as Admin</span>
            </button>
            <div className="text-[10px] text-text-muted font-medium bg-gray-50 p-2.5 rounded border border-border-light leading-relaxed flex items-start gap-1.5">
              <Shield size={14} className="text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-left">
                Admin Creds: <code>admin@assetflow.com</code> / <code>admin</code>. Physical QR code scans bypass login to allow quick field audits.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
