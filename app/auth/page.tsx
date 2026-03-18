"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleSubmit = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Erreur : ${error.message}`);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`Erreur : ${error.message}`);
        return;
      }
      // Créer le profil
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, username, xp: 0, level: 1 });
        if (profileError) {
          setMessage(`Erreur : ${profileError.message}`);
          return;
        }
      }
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h1 className="font-display font-black text-2xl text-text">
          {isLogin ? "Connexion" : "Inscription"}
        </h1>

        {!isLogin && (
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
          />
        )}

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
        />

        <input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-accent text-bg font-display font-bold rounded-xl hover:bg-accent-dim transition-colors"
        >
          {isLogin ? "Se connecter" : "Créer le compte"}
        </button>

        {message && (
          <p className="text-sm text-center font-mono text-accent">{message}</p>
        )}

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
          className="w-full text-text-dim text-sm hover:text-text transition-colors"
        >
          {isLogin
            ? "Pas encore de compte ? S'inscrire"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
