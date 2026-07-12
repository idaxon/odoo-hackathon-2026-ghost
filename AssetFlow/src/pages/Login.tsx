import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Shield, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

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

    setTimeout(() => {
      if (email === 'admin@assetflow.com' && password === 'admin') {
        localStorage.setItem('isAuthenticated', 'true');
        const scan = searchParams.get('scan');
        const redirectPath = scan === 'true' ? '/assets?scan=true' : '/';
        navigate(redirectPath);
      } else {
        setError('Invalid credentials. Use: admin@assetflow.com / admin');
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
    <div className="min-h-screen bg-bg flex font-sans overflow-hidden">
      {/* Split Layout Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left Side: Illustrative Brand Column (Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#714B67] text-white flex-col justify-between p-12 relative overflow-hidden">
          {/* Top tagline */}
          <div className="z-10">
            <p className="text-white/60 text-xs tracking-wider uppercase font-semibold">
              Asset optimization made simple — solutions for you.
            </p>
          </div>

          {/* Core Visual Feature Block */}
          <div className="z-10 space-y-8 my-auto pr-8">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Manage <br />your assets
            </h1>
            
            {/* Pure CSS Mobile Mockup Container */}
            <div className="relative mx-auto w-64 h-[340px] bg-slate-900 rounded-[28px] border-4 border-slate-800 shadow-2xl p-4 overflow-hidden select-none animate-appear">
              {/* Speaker & camera notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
              </div>

              {/* Mock App Interface Screen */}
              <div className="h-full flex flex-col justify-between pt-5 text-[10px] space-y-2">
                {/* Header */}
                <div className="flex justify-between items-center text-white/55 border-b border-white/5 pb-2">
                  <span className="font-semibold">AssetFlow Live</span>
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-sm scale-90">ONLINE</span>
                </div>

                {/* Dashboard Metrics */}
                <div className="bg-white/5 rounded-lg p-2 space-y-1.5 border border-white/5">
                  <div className="flex justify-between text-white/50">
                    <span>Total Valuation</span>
                    <span className="text-secondary font-bold font-mono">₹45,82,000</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[82%]"></div>
                  </div>
                </div>

                {/* Mini Charts / Asset Grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white/5 rounded p-2 text-center space-y-1 border border-white/5">
                    <span className="text-white/40 block">Operational</span>
                    <span className="font-bold text-white font-mono text-[11px]">94.2%</span>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center space-y-1 border border-white/5">
                    <span className="text-white/40 block">Idle Units</span>
                    <span className="font-bold text-amber-400 font-mono text-[11px]">3 Units</span>
                  </div>
                </div>

                {/* Recent Scans Logs trail */}
                <div className="bg-white/5 rounded-lg p-2 space-y-1.5 flex-1 border border-white/5 flex flex-col justify-center">
                  <span className="text-white/35 font-bold uppercase tracking-wider text-[8px]">Recent Audits</span>
                  <div className="space-y-1 text-white/80">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={9} className="text-secondary" />
                      <span className="truncate">MacBook Pro check-in at Block 3</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={9} className="text-secondary" />
                      <span className="truncate">LaserJet ticket resolved</span>
                    </div>
                  </div>
                </div>

                {/* Simulated TabBar */}
                <div className="flex justify-around items-center pt-1.5 border-t border-white/5 text-white/40 text-[8px]">
                  <span className="text-secondary font-bold">Dashboard</span>
                  <span>Assets</span>
                  <span>Tickets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="z-10 text-[10px] text-white/40 flex items-center justify-between">
            <span>© 2006-2026 AssetFlow Inc.</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#017E84] animate-ping"></div>
          </div>

          {/* Backdrop dynamic background circles */}
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/5 border border-white/5 pointer-events-none"></div>
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-white/5 border border-white/5 pointer-events-none"></div>
        </div>

        {/* Right Side: Clean Sign In Form Column */}
        <div className="col-span-1 lg:col-span-7 bg-surface flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 relative">
          
          {/* Header containing Brand Logo and Sign-Up Info */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#714B67] flex items-center justify-center shadow-sm">
                <img src="/logo-icon.svg" className="w-5 h-5 object-contain invert brightness-0" alt="logo" />
              </div>
              <span className="text-sm font-bold text-text tracking-tight">AssetFlow</span>
            </div>
            
            <div className="text-xs text-text-muted">
              Secure administrative access
            </div>
          </div>

          {/* Centered Sign In Form Box */}
          <div className="my-auto max-w-sm w-full mx-auto space-y-6 py-8">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-extrabold text-text tracking-tight">
                Sign In
              </h2>
              <p className="text-xs text-text-muted">
                Access your digital twin panels and resource schedulers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2 animate-appear">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Email / Username field */}
              <div className="space-y-1">
                <input
                  type="email"
                  required
                  placeholder="Email or Username"
                  className="input-premium w-full py-2.5 px-4 rounded-full text-sm border-border-medium focus:border-primary transition-all focus:ring-1 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password field with show toggle */}
              <div className="space-y-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className="input-premium w-full py-2.5 px-4 rounded-full text-sm border-border-medium pr-12 focus:border-primary transition-all focus:ring-1 focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Reset link */}
              <div className="flex justify-start pl-4">
                <button
                  type="button"
                  onClick={() => alert('Please contact system administrator (support@assetflow.com) to reset credentials.')}
                  className="text-xs font-bold text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 px-6 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:opacity-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={15} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Assist preset */}
            <div className="pt-6 border-t border-border-light space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block text-center">
                Hackathon Demo Preset Access:
              </span>
              <button
                type="button"
                onClick={handleQuickLogin}
                className="w-full btn-secondary py-2 px-6 rounded-full text-xs font-bold bg-gray-50 border-border-light text-text hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles size={13} className="text-primary" />
                <span>One-Click Login as Admin</span>
              </button>
              <div className="text-[10px] text-text-muted font-medium bg-gray-50 p-3 rounded-lg border border-border-light leading-relaxed flex items-start gap-1.5">
                <Shield size={14} className="text-[#017E84] flex-shrink-0 mt-0.5" />
                <span className="text-left">
                  Credentials seeded as: <code>admin@assetflow.com</code> / <code>admin</code>. Phone/tablet scanning skips this gate automatically.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Copy */}
          <div className="text-[11px] text-text-muted flex justify-between items-center w-full mt-8 border-t border-border-light pt-4">
            <span>© 2005-2026 AssetFlow Inc.</span>
            <div className="flex gap-4">
              <a href="mailto:support@assetflow.com" className="hover:underline hover:text-primary">Contact Us</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
