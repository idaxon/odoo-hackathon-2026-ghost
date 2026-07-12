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
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      
      {/* Dynamic blurred colored blobs in the background to match Payoneer layout styling */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#714B67]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#017E84]/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main suspeneded container with large rounded corners matching the design */}
      <div className="max-w-5xl w-full bg-white rounded-[32px] shadow-2xl border border-white/40 overflow-hidden flex flex-col md:flex-row min-h-[580px] lg:min-h-[640px] z-10">
        
        {/* Left Side: Illustrative device & copy column (Plum brand background) */}
        <div className="w-full md:w-5/12 bg-[#714B67] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top text tagline */}
          <div className="z-10">
            <p className="text-white/50 text-[10px] tracking-wider uppercase font-semibold">
              Global assets made simple — online asset solutions.
            </p>
          </div>

          {/* Central Title & Phone Mockup */}
          <div className="z-10 my-auto py-6 space-y-8 flex flex-col items-center md:items-start">
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-center md:text-left">
              Optimize <br />your assets
            </h1>

            {/* Premium iPhone-style device frame in CSS */}
            <div className="relative w-56 h-[300px] bg-slate-950 rounded-[30px] border-[3.5px] border-slate-800 shadow-2xl p-3 overflow-hidden select-none animate-appear self-center">
              
              {/* Dynamic island notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-800 rounded-full flex items-center justify-center z-20">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full ml-auto mr-1.5"></div>
              </div>

              {/* Glass glare effect layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-10"></div>

              {/* Smartphone screen interface */}
              <div className="h-full flex flex-col justify-between pt-4 text-[9px] space-y-2 relative">
                {/* Header status */}
                <div className="flex justify-between items-center text-white/40 px-1 font-mono text-[7px]">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <div className="w-4 h-2 border border-white/30 rounded-sm p-[1px] flex items-center">
                      <div className="h-full w-[80%] bg-white rounded-2xs"></div>
                    </div>
                  </div>
                </div>

                {/* Account card mockup */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 space-y-1">
                  <div className="flex justify-between text-white/50">
                    <span>Current Valuation</span>
                    <span className="text-[#017E84] font-bold font-mono">₹45.8L</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#017E84] w-[78%]"></div>
                  </div>
                </div>

                {/* Graph bars representing assets */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2 space-y-1">
                  <div className="flex justify-between text-white/40 text-[7px] uppercase font-bold tracking-wider">
                    <span>Utilization Rate</span>
                    <span className="text-green-400 font-mono">82%</span>
                  </div>
                  <div className="flex items-end justify-between h-10 px-1 pt-1">
                    <div className="w-1.5 h-[40%] bg-[#017E84] rounded-t-xs"></div>
                    <div className="w-1.5 h-[65%] bg-[#017E84] rounded-t-xs"></div>
                    <div className="w-1.5 h-[50%] bg-[#017E84] rounded-t-xs"></div>
                    <div className="w-1.5 h-[85%] bg-green-400 rounded-t-xs"></div>
                    <div className="w-1.5 h-[30%] bg-[#017E84] rounded-t-xs"></div>
                    <div className="w-1.5 h-[70%] bg-[#017E84] rounded-t-xs"></div>
                  </div>
                </div>

                {/* Active scan status ticker */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 space-y-1 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-[#017E84]" />
                  <span className="text-white/80 font-medium truncate text-[8px]">Device audit logs synchronizing...</span>
                </div>

                {/* Simulated Bottom Navigation */}
                <div className="flex justify-around items-center pt-1 border-t border-white/5 text-white/40 text-[7px] font-semibold">
                  <span className="text-[#017E84]">Home</span>
                  <span>Assets</span>
                  <span>Alerts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom attribution copyright */}
          <div className="z-10 text-[9px] text-white/40 flex justify-between items-center border-t border-white/5 pt-3">
            <span>© 2006-2026 AssetFlow Inc.</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#017E84] animate-pulse"></div>
          </div>

          {/* Decorative background shapes */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 border border-white/5 pointer-events-none"></div>
          <div className="absolute top-[-5%] right-[-10%] w-60 h-60 rounded-full bg-white/5 border border-white/5 pointer-events-none"></div>
        </div>

        {/* Right Side: Sign-in input forms (White background) */}
        <div className="w-full md:w-7/12 bg-white p-8 lg:p-12 flex flex-col justify-between">
          
          {/* Header row: Brand logo left, status info right */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#714B67] flex items-center justify-center shadow-sm">
                <img src="/logo-icon.svg" className="w-4 h-4 object-contain invert brightness-0" alt="logo" />
              </div>
              <span className="text-sm font-bold text-text tracking-tight">AssetFlow</span>
            </div>
            
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Secure Login
            </div>
          </div>

          {/* Center Form Section */}
          <div className="my-auto max-w-xs w-full mx-auto space-y-5 py-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-text tracking-tight">
                Sign In
              </h2>
              <p className="text-[11px] text-text-muted">
                Admin gateway for digital twins and scheduler panels.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Alert Message */}
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-100 text-red-700 text-[11px] flex items-start gap-1.5 animate-appear">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Username Input with clean border styling */}
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email or Username"
                  className="input-premium w-full py-2 px-4 rounded-full text-xs border-border-medium focus:border-primary transition-all focus:ring-1 focus:ring-primary shadow-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input with show toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  className="input-premium w-full py-2 px-4 rounded-full text-xs border-border-medium pr-10 focus:border-primary transition-all focus:ring-1 focus:ring-primary shadow-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Forgot link */}
              <div className="flex justify-start pl-3 text-[10px] text-text-muted font-bold">
                <button
                  type="button"
                  onClick={() => alert('Please contact administrative support at support@assetflow.com to retrieve credentials.')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button with brand colors */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#714B67] hover:bg-[#5b3c53] text-white py-2 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={13} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Access Trigger */}
            <div className="pt-4 border-t border-border-light space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block text-center">
                Demo Hotkeys:
              </span>
              <button
                type="button"
                onClick={handleQuickLogin}
                className="w-full bg-gray-50 border border-border-light text-text hover:bg-gray-100 py-1.5 px-4 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Sparkles size={11} className="text-primary" />
                <span>One-Click Login as Admin</span>
              </button>
              <div className="text-[9px] text-text-muted font-medium bg-gray-50 p-2.5 rounded-lg border border-border-light leading-relaxed flex items-start gap-1">
                <Shield size={12} className="text-[#017E84] flex-shrink-0 mt-0.5" />
                <span className="text-left">
                  Credentials: <code>admin@assetflow.com</code> / <code>admin</code>. Physical code scans bypass this view automatically.
                </span>
              </div>
            </div>
          </div>

          {/* Footer information */}
          <div className="text-[10px] text-text-muted flex justify-between items-center w-full mt-4 border-t border-border-light pt-3">
            <span>© 2005-2026 AssetFlow Inc.</span>
            <div className="flex gap-3">
              <a href="mailto:support@assetflow.com" className="hover:underline hover:text-primary">Contact Us</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
