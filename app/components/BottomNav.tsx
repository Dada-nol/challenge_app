"use client";

import { Page } from "../page";

const navItems = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "challenges", label: "Défis", icon: "⚡" },
  { id: "friends", label: "Groupes", icon: "👥" },
  { id: "leaderboard", label: "Top", icon: "🏆" },
  // { id: "messages", label: "Chat", icon: "💬" },
] as const;

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
}

export default function BottomNav({ activePage, setActivePage }: Props) {
  return (
    <nav className="bg-surface/95 backdrop-blur-xl border-t border-border px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                isActive ? "text-accent" : "text-text-dim"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-accent/10 rounded-xl" />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span
                className={`text-[10px] font-display font-semibold relative z-10 ${isActive ? "text-accent" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
