"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface Group {
  id: string;
  name: string;
  emoji: string;
}

interface Challenge {
  id: string;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
  sport_metric: string | null;
  participants: { user: { id: string; username: string } }[];
}

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async (groupId: string) => {
    const res = await fetch(`/api/challenges?group_id=${groupId}`);
    const data = await res.json();
    if (data.challenges) setChallenges(data.challenges);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          const res2 = await fetch(
            `/api/challenges?group_id=${data.groups[0].id}`,
          );
          const data2 = await res2.json();
          if (data2.challenges) setChallenges(data2.challenges);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-text-dim font-mono text-sm">Chargement...</div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-dim text-sm">Bon retour 👋</p>
          <h1 className="font-display font-black text-3xl text-text">
            {profile?.username}
          </h1>
        </div>
        <button
          onClick={signOut}
          className="text-text-dim text-sm hover:text-text transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {/* Groupes */}
      <section>
        <h2 className="font-display font-bold text-lg text-text mb-3">
          Mes groupes
        </h2>
        {groups.length === 0 ? (
          <p className="text-text-dim text-sm">
            Aucun groupe pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => fetchChallenges(group.id)}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface cursor-pointer hover:border-accent/30 transition-colors"
              >
                <span className="text-2xl">{group.emoji}</span>
                <p className="font-display font-semibold text-text">
                  {group.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Défis */}
      <section>
        <h2 className="font-display font-bold text-lg text-text mb-3">
          Défis en cours
        </h2>
        {challenges.length === 0 ? (
          <p className="text-text-dim text-sm">Aucun défi dans ce groupe.</p>
        ) : (
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="p-4 rounded-xl border border-border bg-surface space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-text">
                    {challenge.title}
                  </p>
                  <span className="text-xs font-mono text-text-dim px-2 py-0.5 rounded-full border border-border">
                    {challenge.type === "sport" ? "🏋️ Sport" : "❓ Question"}
                  </span>
                </div>
                <p className="text-text-dim text-xs font-mono">
                  {challenge.start_date} → {challenge.end_date}
                </p>
                {challenge.sport_metric && (
                  <p className="text-text-dim text-xs">
                    Métrique : {challenge.sport_metric}
                  </p>
                )}
                <p className="text-text-dim text-xs">
                  {challenge.participants.length} participant(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
