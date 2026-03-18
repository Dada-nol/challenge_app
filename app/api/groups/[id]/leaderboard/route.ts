import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "week"; // week | month | all

  // Calculer la date de début selon la période
  const now = new Date();
  let startDate: string | null = null;

  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString();
  } else if (period === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    startDate = d.toISOString();
  }

  // Récupérer les membres du groupe avec leur profil
  const { data: members, error } = await supabase
    .from("group_members")
    .select(
      `
    user:profiles (
      id,
      username,
      xp,
      level
    )
  `,
    )
    .eq("group_id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Cast explicite
  const memberList = members.map((m) => {
    const u = m.user as unknown as {
      id: string;
      username: string;
      xp: number;
      level: number;
    } | null;
    return { user: u };
  });

  // Pour week et month, calculer les XP gagnés sur la période
  // via les logs, questions et réponses créés dans la période
  if (startDate) {
    const memberIds = memberList.map((m) => m.user?.id).filter(Boolean);

    // Logs sport dans la période
    const { data: logs } = await supabase
      .from("sport_logs")
      .select("user_id")
      .in("user_id", memberIds)
      .gte("logged_at", startDate);

    // Questions dans la période
    const { data: questions } = await supabase
      .from("daily_questions")
      .select("author_id")
      .in("author_id", memberIds)
      .gte("created_at", startDate);

    // Réponses dans la période
    const { data: answers } = await supabase
      .from("daily_answers")
      .select("author_id")
      .in("author_id", memberIds)
      .gte("created_at", startDate);

    // Participations dans la période
    const { data: joins } = await supabase
      .from("challenge_participants")
      .select("user_id")
      .in("user_id", memberIds)
      .gte("joined_at", startDate);

    // Calculer XP par user sur la période
    const periodXp: Record<string, number> = {};
    memberIds.forEach((id) => {
      if (id) periodXp[id] = 0;
    });

    logs?.forEach((l) => {
      periodXp[l.user_id] = (periodXp[l.user_id] ?? 0) + 20;
    });
    questions?.forEach((q) => {
      periodXp[q.author_id] = (periodXp[q.author_id] ?? 0) + 15;
    });
    answers?.forEach((a) => {
      periodXp[a.author_id] = (periodXp[a.author_id] ?? 0) + 10;
    });
    joins?.forEach((j) => {
      periodXp[j.user_id] = (periodXp[j.user_id] ?? 0) + 10;
    });

    const result = memberList
      .map((m) => ({
        ...m.user,
        periodXp: periodXp[m.user?.id ?? ""] ?? 0,
      }))
      .sort((a, b) => b.periodXp - a.periodXp);

    return NextResponse.json({ leaderboard: result });
  }

  // All time → trier par XP total
  const result = memberList
    .map((m) => ({ ...m.user, periodXp: m.user?.xp ?? 0 }))
    .sort((a, b) => b.periodXp - a.periodXp);

  return NextResponse.json({ leaderboard: result });
}
