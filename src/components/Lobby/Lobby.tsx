import React from 'react';
import { Invite, OnlinePlayer } from '../../services/multiplayer';

interface LobbyProps {
  myUid: string;
  onlinePlayers: OnlinePlayer[];
  invites: Invite[];
  onChallenge: (uid: string) => void;
  onAccept: (gameId: string) => void;
  onDecline: (gameId: string) => void;
}

export function Lobby({ myUid, onlinePlayers, invites, onChallenge, onAccept, onDecline }: LobbyProps) {
  const others = onlinePlayers.filter((p) => p.uid !== myUid);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-amber-300 p-4 flex justify-center">
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-xl font-black text-slate-900 text-center">Online players</h2>

        {invites.length > 0 && (
          <section className="bg-white/95 rounded-2xl p-4 space-y-2 shadow">
            <h3 className="text-sm font-bold text-slate-800">Invites</h3>
            {invites.map((inv) => (
              <div key={inv.gameId} className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 truncate">{inv.fromName} challenged you</span>
                <div className="flex gap-2">
                  <button onClick={() => onAccept(inv.gameId)} className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold">
                    Accept
                  </button>
                  <button onClick={() => onDecline(inv.gameId)} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="bg-white/95 rounded-2xl p-4 space-y-2 shadow">
          {others.length === 0 && (
            <p className="text-sm text-slate-600 text-center py-4">
              No one else is online right now. Ask a friend to log in.
            </p>
          )}
          {others.map((p) => (
            <div key={p.uid} className="flex items-center justify-between gap-2 py-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {p.name}
              </span>
              <button onClick={() => onChallenge(p.uid)} className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-xs font-black">
                Challenge
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
