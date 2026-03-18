"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Challenges from "./components/Challenges";
import Groups from "./components/Groups";
import Leaderboard from "./components/Leaderboard";
import Messages from "./components/Messages";
import BottomNav from "./components/BottomNav";

export type Page =
  | "dashboard"
  | "challenges"
  | "friends"
  | "leaderboard"
  | "messages";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>("dashboard");

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-dim font-mono text-sm">Chargement...</p>
      </div>
    );
  }

  if (!user) return null;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "challenges":
        return <Challenges />;
      case "friends":
        return <Groups />;
      case "leaderboard":
        return <Leaderboard />;
      case "messages":
        return <Messages />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <div className="hidden lg:flex">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen overflow-x-hidden">
        {renderPage()}
      </main>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>
    </div>
  );
}
