"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  emoji: string;
  invite_code: string;
  creator: { username: string };
  members: { role: string; user: { id: string; username: string } }[];
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // États création
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("⚡");

  // États rejoindre
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const [message, setMessage] = useState("");

  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    if (data.groups) setGroups(data.groups);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Groupe créé ✅");
      setName("");
      setEmoji("⚡");
      setShowCreate(false);
      fetchGroups();
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    const res = await fetch("/api/groups/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_code: inviteCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Groupe rejoint ✅");
      setInviteCode("");
      setShowJoin(false);
      fetchGroups();
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setMessage("Code copié ✅");
    setTimeout(() => setMessage(""), 2000);
  };

  if (loading)
    return (
      <div className="p-8 text-text-dim font-mono text-sm">Chargement...</div>
    );

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-3xl text-text">Groupes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowJoin(!showJoin);
              setShowCreate(false);
            }}
            className="px-4 py-2 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
          >
            Rejoindre
          </button>
          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowJoin(false);
            }}
            className="px-4 py-2 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
          >
            + Créer
          </button>
        </div>
      </div>

      {message && <p className="text-accent font-mono text-sm">{message}</p>}

      {/* Form création */}
      {showCreate && (
        <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
          <h2 className="font-display font-bold text-text">Nouveau groupe</h2>
          <div className="flex gap-3">
            <input
              placeholder="Emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-16 bg-bg border border-border rounded-xl px-3 py-2.5 text-text text-center text-xl focus:outline-none focus:border-accent/50"
            />
            <input
              placeholder="Nom du groupe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
            >
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Form rejoindre */}
      {showJoin && (
        <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
          <h2 className="font-display font-bold text-text">
            Rejoindre un groupe
          </h2>
          <input
            placeholder="Code d'invitation"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50 font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoin(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleJoin}
              className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
            >
              Rejoindre
            </button>
          </div>
        </div>
      )}

      {/* Liste des groupes */}
      {groups.length === 0 ? (
        <p className="text-text-dim text-sm">
          T&apos;es dans aucun groupe pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-4 rounded-xl border border-border bg-surface space-y-3 cursor-pointer hover:border-accent/30 transition-colors"
              onClick={() => router.push(`/groups/${group.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.emoji}</span>
                  <div>
                    <p className="font-display font-bold text-text">
                      {group.name}
                    </p>
                    <p className="text-text-dim text-xs">
                      Créé par {group.creator?.username} ·{" "}
                      {group.members?.length ?? 0} membre(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Membres */}
              <div className="flex flex-wrap gap-2">
                {group.members?.map((m) => (
                  <span
                    key={m.user.id}
                    className="text-xs px-2 py-1 rounded-full bg-border text-text-dim font-mono"
                  >
                    {m.user.username} {m.role === "admin" ? "👑" : ""}
                  </span>
                ))}
              </div>

              {/* Code d'invitation */}
              <div
                onClick={() => copyInviteCode(group.invite_code)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-bg border border-border cursor-pointer hover:border-accent/30 transition-colors"
              >
                <p className="text-text-dim text-xs font-mono truncate">
                  {group.invite_code}
                </p>
                <span className="text-text-dim text-xs ml-2 flex-shrink-0">
                  📋 Copier
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
