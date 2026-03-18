/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface Member {
  role: string;
  joined_at: string;
  user: { id: string; username: string; xp: number; level: number };
}

interface Challenge {
  id: string;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
  sport_metric: string | null;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  invite_code: string;
  creator: { id: string; username: string };
  members: Member[];
  challenges: Challenge[];
}

export default function GroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${id}`);
    const data = await res.json();
    if (data.group) setGroup(data.group);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroup();
  }, [fetchGroup]);

  const copyInviteCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce groupe ?")) return;
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/");
    else setMessage("Erreur lors de la suppression");
  };

  const isAdmin =
    group?.members.find((m) => m.user.id === user?.id)?.role === "admin";

  if (loading)
    return (
      <div className="p-8 text-text-dim font-mono text-sm">Chargement...</div>
    );
  if (!group)
    return (
      <div className="p-8 text-text-dim font-mono text-sm">
        Groupe introuvable.
      </div>
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

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{group.emoji}</span>
            <h1 className="font-display font-black text-3xl text-text">
              {group.name}
            </h1>
          </div>
          <p className="text-text-dim text-sm mt-1">
            Créé par {group.creator.username} · {group.members.length} membre(s)
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg border border-red-400/30 text-red-400 text-xs font-display font-semibold hover:bg-red-400/10 transition-colors"
          >
            Supprimer
          </button>
        )}
      </div>

      {message && <p className="text-red-400 font-mono text-sm">{message}</p>}

      {/* Code d'invitation */}
      <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
        <p className="font-display font-semibold text-text text-sm">
          Code d'invitation
        </p>
        <div
          onClick={copyInviteCode}
          className="flex items-center justify-between p-3 rounded-lg bg-bg border border-border cursor-pointer hover:border-accent/30 transition-colors"
        >
          <p className="text-text-dim text-xs font-mono truncate">
            {group.invite_code}
          </p>
          <span className="text-text-dim text-xs ml-2 flex-shrink-0">
            {copied ? "Copié ✅" : "📋 Copier"}
          </span>
        </div>
      </div>

      {/* Membres */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-text">Membres</h2>
        <div className="space-y-2">
          {group.members.map((m) => {
            const avatar = m.user.username.slice(0, 2).toUpperCase();
            const xpProgress = ((m.user.xp % 500) / 500) * 100;
            return (
              <div
                key={m.user.id}
                className={`p-4 rounded-xl border bg-surface space-y-2 ${
                  m.user.id === user?.id ? "border-accent/20" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center font-display font-bold text-bg text-sm flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-display font-bold text-sm ${m.user.id === user?.id ? "text-accent" : "text-text"}`}
                      >
                        {m.user.username}
                      </p>
                      {m.role === "admin" && (
                        <span className="text-xs font-mono text-gold">
                          👑 admin
                        </span>
                      )}
                      {m.user.id === user?.id && (
                        <span className="text-xs text-accent font-mono">
                          (toi)
                        </span>
                      )}
                    </div>
                    <p className="text-text-dim text-xs font-mono">
                      Niv. {m.user.level} · {m.user.xp} XP
                    </p>
                  </div>
                </div>
                {/* XP bar */}
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Défis du groupe */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-text">Défis</h2>
          <button
            onClick={() => router.push("/")}
            className="text-accent text-sm font-display font-semibold hover:text-accent-dim transition-colors"
          >
            + Créer →
          </button>
        </div>
        {group.challenges.length === 0 ? (
          <p className="text-text-dim text-sm">Aucun défi dans ce groupe.</p>
        ) : (
          <div className="space-y-2">
            {group.challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => router.push(`/challenges/${challenge.id}`)}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:border-accent/30 transition-colors"
              >
                <span className="text-lg">
                  {challenge.type === "sport" ? "🏋️" : "❓"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-text text-sm truncate">
                    {challenge.title}
                  </p>
                  <p className="text-text-dim text-xs font-mono">
                    {challenge.start_date} → {challenge.end_date}
                  </p>
                </div>
                <span className="text-text-dim text-xs">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
