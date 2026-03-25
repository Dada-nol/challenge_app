"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const avatar = profile?.username.slice(0, 2).toUpperCase() ?? "??";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpInLevel = xp % 500;
  const xpProgress = (xpInLevel / 500) * 100;
  const xpToNext = 500 - xpInLevel;

  const handleSave = async () => {
    if (!username.trim()) return;
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage("Username mis à jour ✅");
      setEditing(false);
      // Recharger la page pour mettre à jour le context
      router.refresh();
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
    setLoading(false);
  };

  if (!profile)
    return (
      <div className="p-8 text-text-dim font-mono text-sm">Chargement...</div>
    );

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="text-text-dim hover:text-text transition-colors text-sm"
      >
        ← Retour
      </button>

      <h1 className="font-display font-black text-3xl text-text">Profil</h1>

      {message && <p className="text-accent font-mono text-sm">{message}</p>}

      {/* Avatar + username */}
      <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center font-display font-black text-bg text-xl">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text font-display font-bold text-lg focus:outline-none focus:border-accent/50"
                autoFocus
              />
            ) : (
              <p className="font-display font-black text-2xl text-text">
                {profile.username}
              </p>
            )}
            <p className="text-text-dim text-sm font-mono mt-0.5">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Actions username */}
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setUsername(profile.username);
                }}
                className="flex-1 py-2.5 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Sauvegarder"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
            >
              ✏️ Modifier le username
            </button>
          )}
        </div>
      </div>

      {/* XP + Niveau */}
      <div className="p-6 rounded-xl border border-border bg-surface space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-dim text-xs font-mono uppercase tracking-wider mb-1">
              Niveau
            </p>
            <p className="font-display font-black text-4xl text-accent">
              {level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-text-dim text-xs font-mono uppercase tracking-wider mb-1">
              XP Total
            </p>
            <p className="font-mono font-bold text-text text-2xl">{xp}</p>
          </div>
        </div>

        {/* Barre XP */}
        <div>
          <div className="flex justify-between text-xs text-text-dim font-mono mb-2">
            <span>Niveau {level}</span>
            <span>{xpInLevel} / 500 XP</span>
            <span>Niveau {level + 1}</span>
          </div>
          <div className="h-3 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple to-accent rounded-full transition-all duration-1000"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-text-dim text-xs font-mono mt-1.5 text-right">
            {xpToNext} XP avant le niveau {level + 1}
          </p>
        </div>
      </div>

      {/* Déconnexion */}
      <button
        onClick={signOut}
        className="w-full py-3 rounded-xl border border-red-400/30 text-red-400 font-display font-semibold text-sm hover:bg-red-400/10 transition-colors"
      >
        🚪 Déconnexion
      </button>
    </div>
  );
}
