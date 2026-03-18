"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  duration_days: number | null;
  sport_metric: string | null;
  sport_goal: number | null;
  creator: { id: string; username: string };
  participants: { user: { id: string; username: string } }[];
}

interface Group {
  id: string;
  name: string;
  emoji: string;
}

export default function Challenges() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState("");

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"sport" | "daily_question">("sport");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sportMetric, setSportMetric] = useState("");
  const [sportGoal, setSportGoal] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const router = useRouter();

  const fetchChallenges = async (groupId: string) => {
    setLoading(true);
    const res = await fetch(`/api/challenges?group_id=${groupId}`);
    const data = await res.json();
    if (data.challenges) setChallenges(data.challenges);
    setLoading(false);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (data.groups?.length > 0) {
        setGroups(data.groups);
        setSelectedGroup(data.groups[0].id);
        fetchChallenges(data.groups[0].id);
      } else {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    fetchChallenges(groupId);
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedGroup) return;
    if (type === "sport" && (!startDate || !endDate)) return;

    const body: Record<string, unknown> = {
      group_id: selectedGroup,
      title,
      description,
      type,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
    };

    if (type === "sport") {
      body.sport_metric = sportMetric;
      body.sport_goal = parseFloat(sportGoal);
      body.start_date = startDate;
      body.end_date = endDate;
    } else {
      body.start_date = startDate;
      body.end_date = endDate;
      body.duration_days = null;
    }

    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Défi créé ✅");
      setTitle("");
      setDescription("");
      setSportMetric("");
      setSportGoal("");
      setDurationDays("");
      setStartDate("");
      setEndDate("");
      setShowCreate(false);
      fetchChallenges(selectedGroup);
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const handleJoin = async (challengeId: string) => {
    const res = await fetch(`/api/challenges/${challengeId}/join`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Défi rejoint ✅");
      fetchChallenges(selectedGroup!);
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const isParticipant = (challenge: Challenge) => {
    return challenge.participants.some((p) => p.user.id === user?.id);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-3xl text-text">Défis</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
        >
          + Créer
        </button>
      </div>

      {message && <p className="text-accent font-mono text-sm">{message}</p>}

      {/* Sélecteur de groupe */}
      {groups.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGroupChange(g.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${
                selectedGroup === g.id
                  ? "bg-accent text-bg"
                  : "bg-surface border border-border text-text-dim hover:text-text"
              }`}
            >
              <span>{g.emoji}</span>
              <span>{g.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Form création */}
      {showCreate && (
        <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
          <h2 className="font-display font-bold text-text">Nouveau défi</h2>

          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
          />

          <textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50 resize-none"
          />

          {/* Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setType("sport")}
              className={`flex-1 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${
                type === "sport"
                  ? "bg-accent text-bg"
                  : "bg-bg border border-border text-text-dim hover:text-text"
              }`}
            >
              🏋️ Sport
            </button>
            <button
              onClick={() => setType("daily_question")}
              className={`flex-1 py-2 rounded-xl text-sm font-display font-semibold transition-colors ${
                type === "daily_question"
                  ? "bg-accent text-bg"
                  : "bg-bg border border-border text-text-dim hover:text-text"
              }`}
            >
              ❓ Question du jour
            </button>
          </div>

          {/* Champs daily question */}
          {type === "daily_question" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-text-dim text-xs font-mono mb-1 block">
                  Début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent/50"
                />
              </div>
              <div className="flex-1">
                <label className="text-text-dim text-xs font-mono mb-1 block">
                  Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent/50"
                />
              </div>
            </div>
          )}

          {/* Champs sport */}
          {type === "sport" && (
            <>
              <div className="flex gap-3">
                <input
                  placeholder="Métrique (ex: pompes, km...)"
                  value={sportMetric}
                  onChange={(e) => setSportMetric(e.target.value)}
                  className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
                />
                <input
                  placeholder="Objectif (ex: 30)"
                  value={sportGoal}
                  onChange={(e) => setSportGoal(e.target.value)}
                  type="number"
                  className="w-32 bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-text-dim text-xs font-mono mb-1 block">
                    Début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-text-dim text-xs font-mono mb-1 block">
                    Fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>
            </>
          )}

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

      {/* Liste des défis */}
      {loading ? (
        <p className="text-text-dim font-mono text-sm">Chargement...</p>
      ) : challenges.length === 0 ? (
        <p className="text-text-dim text-sm">Aucun défi dans ce groupe.</p>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 rounded-xl border border-border bg-surface space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-dim px-2 py-0.5 rounded-full border border-border">
                      {challenge.type === "sport" ? "🏋️ Sport" : "❓ Question"}
                    </span>
                  </div>
                  <p className="font-display font-bold text-text">
                    {challenge.title}
                  </p>
                  {challenge.description && (
                    <p className="text-text-dim text-sm mt-0.5">
                      {challenge.description}
                    </p>
                  )}
                </div>

                {/* Bouton selon type */}
                {challenge.type === "daily_question" ? (
                  <button
                    onClick={() => router.push(`/challenges/${challenge.id}`)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-border text-text-dim text-xs font-display font-semibold hover:text-text transition-colors"
                  >
                    Explorer →
                  </button>
                ) : challenge.type === "sport" && isParticipant(challenge) ? (
                  <button
                    onClick={() => router.push(`/challenges/${challenge.id}`)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-border text-text-dim text-xs font-display font-semibold hover:text-text transition-colors"
                  >
                    Voir →
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(challenge.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-accent text-bg text-xs font-display font-bold hover:bg-accent-dim transition-colors"
                  >
                    Rejoindre
                  </button>
                )}
              </div>

              {challenge.sport_metric && (
                <p className="text-text-dim text-xs font-mono">
                  Objectif : {challenge.sport_goal} {challenge.sport_metric}
                </p>
              )}

              {challenge.type === "daily_question" &&
                challenge.duration_days && (
                  <p className="text-text-dim text-xs font-mono">
                    Durée : {challenge.duration_days} jours
                  </p>
                )}

              <div className="flex items-center justify-between text-xs text-text-dim font-mono">
                {challenge.type === "sport" ? (
                  <span>
                    {challenge.start_date} → {challenge.end_date}
                  </span>
                ) : (
                  <span>Créée le {challenge.start_date}</span>
                )}
                <span>{challenge.participants.length} participant(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
