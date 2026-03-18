"use client";

import { useAuth } from "../context/AuthContext";
import { Page } from "../page";
import { useRouter } from "next/navigation";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "challenges", label: "Défis", icon: "🎯" },
  { id: "friends", label: "Groupes", icon: "👥" },
  { id: "leaderboard", label: "Classement", icon: "🏆" },
  { id: "messages", label: "Messages", icon: "💬" },
] as const;

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
}

export default function Sidebar({ activePage, setActivePage }: Props) {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const avatar = profile?.username.slice(0, 2).toUpperCase() ?? "??";
  const xpProgress = profile ? ((profile.xp % 500) / 500) * 100 : 0;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center glow-accent">
            <span className="text-bg font-display font-black text-sm">C</span>
          </div>
          <span className="font-display font-bold text-xl text-text tracking-tight">
            FC Panda
          </span>
        </div>
      </div>

      {/* User mini-profile */}
      <div
        className="p-4 mx-3 mt-4 rounded-xl bg-border/30 border border-border cursor-pointer hover:border-accent/30 transition-colors"
        onClick={() => router.push("/profile")}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center font-display font-bold text-bg text-sm">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-text text-sm truncate">
              {profile?.username ?? "..."}
            </p>
            <p className="text-text-dim text-xs font-mono">
              Niv. {profile?.level ?? 1} · {profile?.xp ?? 0} XP
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-text-dim font-mono mb-1">
            <span>XP</span>
            <span>
              {profile?.xp ?? 0} / {(profile?.level ?? 1) * 500}{" "}
            </span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full xp-bar-fill"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 border border-accent/20 text-accent"
                  : "text-text-dim hover:text-text hover:bg-border/50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span
                className={`font-display font-semibold text-sm ${isActive ? "text-accent" : ""}`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-dim hover:text-text hover:bg-border/50 transition-all">
          <span>⚙️</span>
          <span className="font-display font-semibold text-sm">Paramètres</span>
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-dim hover:text-text hover:bg-border/50 transition-all"
        >
          <span>🚪</span>
          <span className="font-display font-semibold text-sm">
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  );
}
