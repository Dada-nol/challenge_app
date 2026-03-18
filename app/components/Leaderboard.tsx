"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

interface Group {
  id: string;
  name: string;
  emoji: string;
}

interface Player {
  id: string;
  username: string;
  xp: number;
  level: number;
  periodXp: number;
}

const periods = [
  { label: "Cette semaine", value: "week" },
  { label: "Ce mois", value: "month" },
  { label: "All time", value: "all" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (groupId: string, p: string) => {
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/leaderboard?period=${p}`);
    const data = await res.json();
    if (data.leaderboard) setLeaderboard(data.leaderboard);
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (data.groups?.length > 0) {
        setGroups(data.groups);
        setSelectedGroup(data.groups[0].id);
        fetchLeaderboard(data.groups[0].id, "week");
      } else {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [fetchLeaderboard]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    if (selectedGroup) fetchLeaderboard(selectedGroup, p);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    fetchLeaderboard(groupId, period);
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-text tracking-tight">
          Classement
        </h1>
        <p className="text-text-dim text-sm mt-1">
          {leaderboard.length} membre(s)
        </p>
      </div>

      {/* Sélecteur groupe */}
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

      {/* Sélecteur période */}
      <div className="flex gap-2 p-1 bg-surface border border-border rounded-xl w-fit">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={`px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all ${
              period === p.value
                ? "bg-accent text-bg"
                : "text-text-dim hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-dim font-mono text-sm">Chargement...</p>
      ) : leaderboard.length === 0 ? (
        <p className="text-text-dim text-sm">Pas encore de données.</p>
      ) : (
        <div className="space-y-6">
          {/* Podium */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-4">
              {top3[1] && (
                <PodiumCard
                  player={top3[1]}
                  position={2}
                  isMe={top3[1].id === user?.id}
                />
              )}
              {top3[0] && (
                <PodiumCard
                  player={top3[0]}
                  position={1}
                  isMe={top3[0].id === user?.id}
                />
              )}
              {top3[2] && (
                <PodiumCard
                  player={top3[2]}
                  position={3}
                  isMe={top3[2].id === user?.id}
                />
              )}
            </div>
          )}

          {/* Reste */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((player, i) => {
                const avatar = player.username.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border card-hover animate-fade-in ${
                      player.id === user?.id
                        ? "bg-accent/5 border-accent/20"
                        : "bg-surface border-border"
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="font-mono font-bold text-text-dim w-6 text-center">
                      #{i + 4}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center font-display font-bold text-bg text-sm">
                      {avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-display font-bold text-sm ${player.id === user?.id ? "text-accent" : "text-text"}`}
                        >
                          {player.username}
                        </p>
                        {player.id === user?.id && (
                          <span className="text-xs text-accent font-mono">
                            (toi)
                          </span>
                        )}
                      </div>
                      <p className="text-text-dim text-xs font-mono">
                        Niv. {player.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-accent text-sm">
                        +{player.periodXp} XP
                      </p>
                      <p className="text-text-dim text-xs">
                        {period === "week"
                          ? "cette semaine"
                          : period === "month"
                            ? "ce mois"
                            : "total"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PodiumCard({
  player,
  position,
  isMe,
}: {
  player: Player;
  position: number;
  isMe: boolean;
}) {
  const heights: Record<number, string> = { 1: "h-24", 2: "h-16", 3: "h-12" };
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const colors: Record<number, string> = {
    1: "border-accent/30 bg-accent/10",
    2: "border-gold/30 bg-gold/10",
    3: "border-purple/30 bg-purple/10",
  };
  const avatar = player.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative animate-float"
        style={{ animationDelay: `${position * 200}ms` }}
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center font-display font-bold text-bg">
          {avatar}
        </div>
        {position === 1 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">
            👑
          </div>
        )}
      </div>
      <p
        className={`font-display font-bold text-sm ${isMe ? "text-accent" : "text-text"}`}
      >
        {player.username}
      </p>
      <p className="font-mono text-xs text-accent">+{player.periodXp} XP</p>
      <p className="text-text-dim text-xs font-mono">Niv. {player.level}</p>
      <div
        className={`w-20 rounded-t-xl flex items-end justify-center pb-2 border-t border-x ${heights[position]} ${colors[position]}`}
      >
        <span className="text-2xl">{medals[position]}</span>
      </div>
    </div>
  );
}
