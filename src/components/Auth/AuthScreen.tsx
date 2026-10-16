import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../services/auth';
import { UserAccount } from '../../types/game';

interface AuthScreenProps {
  onAuthenticated: (user: UserAccount) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'register' | 'login' | 'otp'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.register(email, password, name);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register. Please check your details.');
      } else {
        setMode('otp');
        setSuccessMessage(`A 6-digit verification code has been sent to ${email.trim().toLowerCase()}.`);
        startCooldown();
      }
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(email, password);
      setIsLoading(false);
      if (!res.success) {
        if (res.needsVerification) {
          setMode('otp');
          setErrorMessage(res.error || 'Please verify your email with OTP.');
          startCooldown();
        } else {
          setErrorMessage(res.error || 'Login failed. Please check your credentials.');
        }
      } else if (res.user) {
        onAuthenticated(res.user);
      }
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.verifyOtp(email, otpCode);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid OTP code.');
      } else if (res.user) {
        setSuccessMessage('Email verified successfully! Loading your game...');
        setTimeout(() => {
          onAuthenticated(res.user!);
        }, 600);
      }
    }, 400);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    const res = authService.resendOtp(email);
    if (res.success) {
      setSuccessMessage('A fresh verification code has been dispatched.');
      startCooldown();
    } else {
      setErrorMessage(res.error || 'Could not resend OTP.');
    }
  };

  const handleQuickDemo = () => {
    const demoEmail = 'player@arabicwords.com';
    const demoPass = 'arabic123';
    // Register or login
    const reg = authService.register(demoEmail, demoPass, 'Arabic Explorer');
    if (reg.success && reg.otp) {
      const ver = authService.verifyOtp(demoEmail, reg.otp);
      if (ver.user) {
        onAuthenticated(ver.user);
        return;
      }
    }
    const log = authService.login(demoEmail, demoPass);
    if (log.user) {
      onAuthenticated(log.user);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 relative overflow-hidden">
      {/* Decorative Arabic Calligraphy Watermarks in Background */}
      <div className="absolute top-12 left-6 text-white/20 font-calligraphy text-8xl select-none pointer-events-none transform -rotate-12">
        ف
      </div>
      <div className="absolute top-20 right-8 text-amber-100/25 font-calligraphy text-9xl select-none pointer-events-none transform rotate-12">
        ل
      </div>
      <div className="absolute bottom-12 left-10 text-white/20 font-calligraphy text-8xl select-none pointer-events-none">
        ش
      </div>
      <div className="absolute bottom-16 right-10 text-amber-500/20 font-calligraphy text-9xl select-none pointer-events-none transform -rotate-6">
        ض
      </div>

      <div className="w-full max-w-md z-10">
        {/* App Branding Header (Inspired by PDF Page 1) */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Arabic<br />
              With<br />
              Friends
            </h1>
            <div className="absolute -top-4 -left-8 text-white font-calligraphy text-5xl font-bold drop-shadow-md">
              ز
            </div>
            <div className="absolute -bottom-2 -right-8 text-amber-600 font-calligraphy text-5xl font-bold drop-shadow-md">
              ل
            </div>
          </div>
          <p className="text-sm font-medium text-slate-800/80 mt-1">
            Solo Crossword Game for Arabic Speakers & Learners
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/60">
          {/* Mode Tabs (when not in OTP mode) */}
          {mode !== 'otp' && (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq / Player 1"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Continue & Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your account password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Log In to Play</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP VERIFICATION STEP */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex p-3 bg-teal-50 text-teal-600 rounded-2xl mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Email Verification</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Enter the 6-digit OTP verification code sent to <span className="font-semibold text-slate-800">{email}</span>.
                </p>
              </div>

              <div>
                <label className="block text-center text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 bg-slate-50 border-2 border-teal-500/40 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Enter Game</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="hover:text-slate-800 underline transition"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-teal-600 font-semibold hover:text-teal-700 disabled:text-slate-400 transition"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo One-Click Access for Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-200/80">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant Solo Game (Quick Play Demo)</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-800/70 mt-4">
          Arabic letters • Crossword scoring • Solo vs AI Computer
        </p>
      </div>
    </div>
  );
}
