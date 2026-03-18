import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addXP, XP_REWARDS } from "@/utils/xp";
import { differenceInCalendarDays } from "date-fns";

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

  const { data, error } = await supabase
    .from("daily_questions")
    .select(
      `
      id,
      content,
      date,
      author:profiles!daily_questions_author_id_fkey (id, username),
      daily_answers (
        id,
        content,
        created_at,
        author:profiles!daily_answers_author_id_fkey (id, username)
      )
    `,
    )
    .eq("challenge_id", id)
    .order("date", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ questions: data });
}

export async function POST(
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

  const { content } = await request.json();

  // Récupérer le défi + participants triés par date d'inscription
  const { data: challenge } = await supabase
    .from("challenges")
    .select("start_date")
    .eq("id", id)
    .single();

  if (!challenge)
    return NextResponse.json({ error: "Défi introuvable" }, { status: 404 });

  const { data: participants } = await supabase
    .from("challenge_participants")
    .select("user_id")
    .eq("challenge_id", id)
    .order("joined_at", { ascending: true });

  if (!participants?.length)
    return NextResponse.json({ error: "Aucun participant" }, { status: 400 });

  // Calculer à qui c'est le tour aujourd'hui
  const today = new Date();
  const dayIndex = differenceInCalendarDays(
    today,
    new Date(challenge.start_date),
  );
  const todaysAuthorId = participants[dayIndex % participants.length].user_id;

  if (todaysAuthorId !== user.id) {
    return NextResponse.json(
      { error: "C'est pas ton tour aujourd'hui" },
      { status: 403 },
    );
  }

  // Vérifier qu'il n'y a pas déjà une question aujourd'hui
  const todayStr = today.toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("daily_questions")
    .select("id")
    .eq("challenge_id", id)
    .eq("date", todayStr)
    .single();

  if (existing)
    return NextResponse.json(
      { error: "Question déjà posée aujourd'hui" },
      { status: 400 },
    );

  const { data: question, error } = await supabase
    .from("daily_questions")
    .insert({
      challenge_id: id,
      author_id: user.id,
      content,
      date: todayStr,
    })
    .select()
    .single();

  await addXP(supabase, user.id, XP_REWARDS.join_group);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ question }, { status: 201 });
}
