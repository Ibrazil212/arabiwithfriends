import React, { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/auth';
import { UserAccount } from '../../types/game';

interface AuthScreenProps {
  onAuthenticated: (user: UserAccount) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
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

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.requestEmailCode(email);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Could not send the code. Please try again.');
        return;
      }
      setStep('otp');
      setOtpCode('');
      setSuccessMessage(`A 6-digit code was sent to ${email.trim().toLowerCase()}.`);
      startCooldown();
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
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Invalid code.');
        return;
      }
      onAuthenticated(res.user);
    }, 400);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    const res = authService.resendOtp(email);
    if (res.success) {
      setSuccessMessage('A new code was sent.');
      startCooldown();
    } else {
      setErrorMessage(res.error || 'Could not resend the code.');
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtpCode('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleQuickDemo = () => {
    const demoEmail = 'player@arabicwords.com';
    const res = authService.requestEmailCode(demoEmail);
    if (res.success && res.otp) {
      const ver = authService.verifyOtp(demoEmail, res.otp);
      if (ver.user) onAuthenticated(ver.user);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-5 bg-gradient-to-b from-emerald-50 via-green-100 to-lime-200 text-slate-900">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Arabic With Friends" className="w-28 h-28 object-contain" />
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-emerald-900">Arabic With Friends</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-emerald-100">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none text-base"
                  />
                </div>
              </div>

              {errorMessage && <p className="text-sm text-rose-600 font-semibold">{errorMessage}</p>}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-md disabled:opacity-50 transition"
              >
                {isLoading ? 'Sending code...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Enter the code sent to <span className="font-bold text-slate-800 break-all">{email.trim().toLowerCase()}</span>
                </span>
              </div>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none text-center text-3xl font-bold tracking-[0.4em] text-slate-900"
              />

              {successMessage && <p className="text-sm text-emerald-700 font-semibold">{successMessage}</p>}
              {errorMessage && <p className="text-sm text-rose-600 font-semibold">{errorMessage}</p>}

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3.5 rounded-xl font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-md disabled:opacity-50 transition"
              >
                {isLoading ? 'Checking...' : 'Enter the game'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleBack} className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900">
                  <ArrowLeft className="w-4 h-4" /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="font-bold text-emerald-700 disabled:text-slate-400"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={handleQuickDemo}
          className="mt-5 w-full text-sm font-semibold text-emerald-900/70 hover:text-emerald-900"
        >
          Quick play demo
        </button>
      </div>
    </div>
  );
}
