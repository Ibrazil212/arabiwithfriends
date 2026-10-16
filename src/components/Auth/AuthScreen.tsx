import React, { useState } from 'react';
import { login, register, authErrorMessage } from '../../services/auth';

type Mode = 'login' | 'register';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please enter your name.');
          return;
        }
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      // App listens to auth state and switches screens automatically.
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white/95 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900">Arabic With Friends</h1>
          <p className="text-xs text-slate-600">Play word battles in real time with friends online.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`py-2 rounded-lg text-sm font-bold ${
                mode === m ? 'bg-white shadow text-teal-700' : 'text-slate-500'
              }`}
            >
              {m === 'login' ? 'Log in' : 'Create account'}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <input className={inputClass} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input
          className={inputClass}
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={inputClass}
          type="password"
          placeholder="Password (min. 6 characters)"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-teal-600 text-white font-black disabled:opacity-60"
        >
          {isLoading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
