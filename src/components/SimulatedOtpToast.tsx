import React, { useEffect, useState } from 'react';
import { Mail, KeyRound, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { onOtpDelivered, OtpDeliveryEvent } from '../services/auth';

export function SimulatedOtpToast({ onCodeCopied }: { onCodeCopied?: (code: string) => void }) {
  const [latestOtp, setLatestOtp] = useState<OtpDeliveryEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const unsub = onOtpDelivered((event) => {
      setLatestOtp(event);
      setCopied(false);
      setTimeLeft(Math.max(0, Math.floor((event.expiresAt - Date.now()) / 1000)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!latestOtp) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((latestOtp.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [latestOtp]);

  if (!latestOtp || timeLeft <= 0) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(latestOtp.code);
    setCopied(true);
    if (onCodeCopied) onCodeCopied(latestOtp.code);
    setTimeout(() => setCopied(false), 2500);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900/95 text-white border border-teal-500/40 rounded-2xl shadow-2xl backdrop-blur-md p-4 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
            <div className="p-1.5 bg-teal-500/20 rounded-lg text-teal-400">
              <Mail className="w-4 h-4" />
            </div>
            <span>Simulated Email Inbox</span>
          </div>
          <button
            onClick={() => setLatestOtp(null)}
            className="text-slate-400 hover:text-white p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-2">
          Verification email sent to: <span className="font-semibold text-teal-200">{latestOtp.email}</span>
        </p>

        <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xl tracking-widest font-bold text-amber-300">
              {latestOtp.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-lg text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> 6-digit one-time code
          </span>
          <span>
            Expires in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      </div>
    </div>
  );
}
