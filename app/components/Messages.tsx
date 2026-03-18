"use client";

import { useState } from "react";

const conversations = [
  {
    id: 1,
    name: "Jade",
    avatar: "JA",
    color: "from-accent to-green-400",
    lastMsg: "GG t'as complété le défi 🔥",
    time: "14:32",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Groupe Ballers 🏀",
    avatar: "GB",
    color: "from-purple to-pink-500",
    lastMsg: "Nico: Qui tente le défi demain ?",
    time: "13:10",
    unread: 1,
    online: false,
  },
  {
    id: 3,
    name: "Nico",
    avatar: "NI",
    color: "from-gold to-orange-500",
    lastMsg: "T'as vu mon nouveau record ?",
    time: "hier",
    unread: 0,
    online: true,
  },
  {
    id: 4,
    name: "Sarah",
    avatar: "SA",
    color: "from-purple to-pink-500",
    lastMsg: "Défi accepté 😤",
    time: "hier",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Kévin",
    avatar: "KE",
    color: "from-blue-500 to-cyan-400",
    lastMsg: "Tu veux qu'on fasse ça en groupe ?",
    time: "lun",
    unread: 0,
    online: false,
  },
];

const mockMessages = [
  {
    id: 1,
    from: "Jade",
    text: "Yo ! T'as vu le nouveau défi de Kévin ?",
    time: "14:20",
    mine: false,
  },
  {
    id: 2,
    from: "me",
    text: "Ouais je viens de le voir, il est chaud 😅",
    time: "14:22",
    mine: true,
  },
  { id: 3, from: "Jade", text: "Tu vas tenter ?", time: "14:24", mine: false },
  {
    id: 4,
    from: "me",
    text: "Sûr ! J'ai besoin des XP pour passer niveau 43",
    time: "14:25",
    mine: true,
  },
  {
    id: 5,
    from: "Jade",
    text: "Haha motivé ! GG t'as complété le défi 🔥",
    time: "14:32",
    mine: false,
  },
];

export default function Messages() {
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const active = conversations.find((c) => c.id === activeConv);

  return (
    <div className="h-screen flex">
      <div
        className={`w-full lg:w-80 flex-shrink-0 border-r border-border flex flex-col ${activeConv ? "hidden lg:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-border">
          <h1 className="font-display font-black text-2xl text-text mb-4">
            Messages
          </h1>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-sm">
              🔍
            </span>
            <input
              placeholder="Rechercher..."
              className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2.5 text-text text-sm placeholder-text-dim focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-surface transition-colors border-b border-border/50 ${activeConv === conv.id ? "bg-surface" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center font-display font-bold text-bg text-sm`}
                >
                  {conv.avatar}
                </div>
                {conv.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-bg" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-text text-sm truncate">
                    {conv.name}
                  </p>
                  <span className="text-text-dim text-xs flex-shrink-0 ml-2">
                    {conv.time}
                  </span>
                </div>
                <p className="text-text-dim text-xs truncate mt-0.5">
                  {conv.lastMsg}
                </p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-bg text-[10px] font-bold">
                    {conv.unread}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeConv && active ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-surface/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveConv(null)}
              className="lg:hidden text-text-dim hover:text-text mr-1"
            >
              ←
            </button>
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${active.color} flex items-center justify-center font-display font-bold text-bg text-xs`}
              >
                {active.avatar}
              </div>
              {active.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-surface" />
              )}
            </div>
            <div>
              <p className="font-display font-bold text-text text-sm">
                {active.name}
              </p>
              <p className="text-text-dim text-xs">
                {active.online ? "En ligne" : "Hors ligne"}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.mine ? "bg-accent text-bg rounded-br-sm" : "bg-surface border border-border text-text rounded-bl-sm"}`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${msg.mine ? "text-bg/60" : "text-text-dim"}`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex gap-3 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-text text-sm placeholder-text-dim focus:outline-none focus:border-accent/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && setInput("")}
              />
              <button
                onClick={() => setInput("")}
                className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-bg hover:bg-accent-dim transition-colors"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3">
          <span className="text-5xl">💬</span>
          <p className="font-display font-bold text-text-dim text-lg">
            Sélectionne une conversation
          </p>
        </div>
      )}
    </div>
  );
}
