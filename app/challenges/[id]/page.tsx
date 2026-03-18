/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface Answer {
  id: string;
  content: string;
  created_at: string;
  author: { id: string; username: string };
}

interface Question {
  id: string;
  content: string;
  date: string;
  author: { id: string; username: string };
  daily_answers: Answer[];
}

interface SportLog {
  id: string;
  value: number;
  note: string | null;
  logged_at: string;
  user: { id: string; username: string };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  sport_metric: string | null;
  sport_goal: number | null;
  participants: { user: { id: string; username: string } }[];
  sport_logs: SportLog[];
}

export default function ChallengePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Form question
  const [questionContent, setQuestionContent] = useState("");
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Form réponse
  const [answerContent, setAnswerContent] = useState<Record<string, string>>(
    {},
  );

  // Form sport log
  const [logValue, setLogValue] = useState("");
  const [logNote, setLogNote] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);

  const refetchData = useCallback(async () => {
    const [challengeRes, questionsRes] = await Promise.all([
      fetch(`/api/challenges/${id}`),
      fetch(`/api/challenges/${id}/questions`),
    ]);
    const challengeData = await challengeRes.json();
    const questionsData = await questionsRes.json();
    if (challengeData.challenge) setChallenge(challengeData.challenge);
    if (questionsData.questions) setQuestions(questionsData.questions);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchData();
  }, [refetchData]);

  const handlePostQuestion = async () => {
    if (!questionContent.trim()) return;
    const res = await fetch(`/api/challenges/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: questionContent }),
    });
    const data = await res.json();
    if (res.ok) {
      setQuestionContent("");
      setShowQuestionForm(false);
      setMessage("Question postée ✅");
      refetchData();
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const handlePostAnswer = async (questionId: string) => {
    const content = answerContent[questionId];
    if (!content?.trim()) return;
    const res = await fetch(`/api/challenges/${id}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: questionId, content }),
    });
    const data = await res.json();
    if (res.ok) {
      setAnswerContent((prev) => ({ ...prev, [questionId]: "" }));
      setMessage("Réponse postée ✅");
      refetchData();
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const handlePostLog = async () => {
    if (!logValue) return;
    const res = await fetch(`/api/challenges/${id}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: parseFloat(logValue), note: logNote }),
    });
    const data = await res.json();
    if (res.ok) {
      setLogValue("");
      setLogNote("");
      setShowLogForm(false);
      setMessage("Log ajouté ✅");
      refetchData();
    } else {
      setMessage(`Erreur : ${data.error}`);
    }
  };

  const hasAnswered = (question: Question) => {
    return question.daily_answers.some((a) => a.author.id === user?.id);
  };

  const isToday = (dateStr: string) => {
    return new Date(dateStr).toDateString() === new Date().toDateString();
  };

  const getTodaysAuthor = () => {
    if (!challenge) return null;
    const participants = challenge.participants;
    if (!participants.length) return null;
    const dayIndex = Math.floor(
      (new Date().getTime() - new Date(challenge.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return participants[dayIndex % participants.length].user;
  };

  // Classement sport — total par user
  const getSportLeaderboard = () => {
    if (!challenge?.sport_logs) return [];
    const totals: Record<string, { username: string; total: number }> = {};
    challenge.sport_logs.forEach((log) => {
      if (!totals[log.user.id]) {
        totals[log.user.id] = { username: log.user.username, total: 0 };
      }
      totals[log.user.id].total += log.value;
    });
    return Object.entries(totals)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.total - a.total);
  };

  const todaysAuthor = getTodaysAuthor();
  const isMyTurn = todaysAuthor?.id === user?.id;
  const todaysQuestion = questions.find((q) => isToday(q.date));
  const leaderboard = getSportLeaderboard();

  if (loading)
    return (
      <div className="p-8 text-text-dim font-mono text-sm">Chargement...</div>
    );
  if (!challenge)
    return (
      <div className="p-8 text-text-dim font-mono text-sm">
        Défi introuvable.
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

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-text-dim px-2 py-0.5 rounded-full border border-border">
            {challenge.type === "sport" ? "🏋️ Sport" : "❓ Question du jour"}
          </span>
        </div>
        <h1 className="font-display font-black text-3xl text-text">
          {challenge.title}
        </h1>
        {challenge.description && (
          <p className="text-text-dim text-sm mt-1">{challenge.description}</p>
        )}
        <p className="text-text-dim text-xs font-mono mt-2">
          {challenge.start_date} → {challenge.end_date} ·{" "}
          {challenge.participants.length} participant(s)
        </p>
      </div>

      {message && <p className="text-accent font-mono text-sm">{message}</p>}

      {/* ─── SPORT ─── */}
      {challenge.type === "sport" && (
        <>
          {/* Objectif */}
          {challenge.sport_metric && (
            <div className="p-4 rounded-xl border border-border bg-surface">
              <p className="text-text-dim text-xs font-mono mb-1">Objectif</p>
              <p className="font-display font-bold text-text text-xl">
                {challenge.sport_goal} {challenge.sport_metric}
              </p>
            </div>
          )}

          {/* Ajouter un log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-text">
                Mes performances
              </h2>
              <button
                onClick={() => setShowLogForm(!showLogForm)}
                className="px-4 py-2 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
              >
                + Ajouter
              </button>
            </div>

            {showLogForm && (
              <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder={`Valeur (${challenge.sport_metric ?? "unité"})`}
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
                  />
                </div>
                <input
                  placeholder="Note (optionnel)"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLogForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePostLog}
                    className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Classement */}
          {leaderboard.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display font-bold text-text">Classement</h2>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border ${
                      entry.id === user?.id
                        ? "bg-accent/5 border-accent/20"
                        : "bg-surface border-border"
                    }`}
                  >
                    <span className="font-mono font-bold text-text-dim w-6 text-center">
                      #{i + 1}
                    </span>
                    <p
                      className={`flex-1 font-display font-semibold ${entry.id === user?.id ? "text-accent" : "text-text"}`}
                    >
                      {entry.username} {entry.id === user?.id && "(toi)"}
                    </p>
                    <p className="font-mono font-bold text-accent">
                      {entry.total} {challenge.sport_metric}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tous les logs */}
          {challenge.sport_logs?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display font-bold text-text">Historique</h2>
              <div className="space-y-2">
                {challenge.sport_logs
                  .sort(
                    (a, b) =>
                      new Date(b.logged_at).getTime() -
                      new Date(a.logged_at).getTime(),
                  )
                  .map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface"
                    >
                      <div className="flex-1">
                        <p className="font-display font-semibold text-text text-sm">
                          {log.user.username}
                        </p>
                        {log.note && (
                          <p className="text-text-dim text-xs mt-0.5">
                            {log.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-accent">
                          {log.value} {challenge.sport_metric}
                        </p>
                        <p className="text-text-dim text-xs font-mono">
                          {new Date(log.logged_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── DAILY QUESTION ─── */}
      {challenge.type === "daily_question" && (
        <>
          <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-text">Aujourd'hui</h2>
              {todaysAuthor && (
                <span className="text-text-dim text-xs font-mono">
                  Tour de {isMyTurn ? "toi 👋" : todaysAuthor.username}
                </span>
              )}
            </div>

            {todaysQuestion ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-bg border border-border">
                  <p className="text-text-dim text-xs font-mono mb-1">
                    {todaysQuestion.author.username} a demandé :
                  </p>
                  <p className="text-text font-display font-semibold">
                    {todaysQuestion.content}
                  </p>
                </div>

                {todaysQuestion.daily_answers.length > 0 && (
                  <div className="space-y-2">
                    {todaysQuestion.daily_answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="p-3 rounded-lg bg-bg border border-border"
                      >
                        <p className="text-text-dim text-xs font-mono mb-1">
                          {answer.author.username}
                        </p>
                        <p className="text-text text-sm">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!hasAnswered(todaysQuestion) && (
                  <div className="flex gap-2">
                    <input
                      placeholder="Ta réponse..."
                      value={answerContent[todaysQuestion.id] ?? ""}
                      onChange={(e) =>
                        setAnswerContent((prev) => ({
                          ...prev,
                          [todaysQuestion.id]: e.target.value,
                        }))
                      }
                      className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
                    />
                    <button
                      onClick={() => handlePostAnswer(todaysQuestion.id)}
                      className="px-4 py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
                    >
                      Envoyer
                    </button>
                  </div>
                )}
              </div>
            ) : isMyTurn ? (
              <div className="space-y-3">
                <p className="text-text-dim text-sm">
                  C'est ton tour de poser la question du jour !
                </p>
                {showQuestionForm ? (
                  <div className="space-y-2">
                    <input
                      placeholder="Ta question..."
                      value={questionContent}
                      onChange={(e) => setQuestionContent(e.target.value)}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-dim text-sm focus:outline-none focus:border-accent/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowQuestionForm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-border text-text-dim text-sm font-display font-semibold hover:text-text transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handlePostQuestion}
                        className="flex-1 py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
                      >
                        Poster
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="w-full py-2.5 rounded-xl bg-accent text-bg text-sm font-display font-bold hover:bg-accent-dim transition-colors"
                  >
                    Poser la question du jour
                  </button>
                )}
              </div>
            ) : (
              <p className="text-text-dim text-sm">
                En attente de la question de {todaysAuthor?.username}...
              </p>
            )}
          </div>

          {questions.filter((q) => !isToday(q.date)).length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display font-bold text-text">Historique</h2>
              {questions
                .filter((q) => !isToday(q.date))
                .map((question) => (
                  <div
                    key={question.id}
                    className="p-4 rounded-xl border border-border bg-surface space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-text-dim text-xs font-mono">
                        {question.date}
                      </p>
                      <p className="text-text-dim text-xs font-mono">
                        {question.daily_answers.length} réponse(s)
                      </p>
                    </div>
                    <p className="text-text-dim text-xs font-mono">
                      {question.author.username} a demandé :
                    </p>
                    <p className="font-display font-semibold text-text">
                      {question.content}
                    </p>
                    {question.daily_answers.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {question.daily_answers.map((answer) => (
                          <div
                            key={answer.id}
                            className="p-2.5 rounded-lg bg-bg border border-border"
                          >
                            <p className="text-text-dim text-xs font-mono mb-1">
                              {answer.author.username}
                            </p>
                            <p className="text-text text-sm">
                              {answer.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
