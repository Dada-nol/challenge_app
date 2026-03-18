import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("group_id");

  if (!groupId)
    return NextResponse.json({ error: "group_id requis" }, { status: 400 });

  // Vérifier que l'user est membre du groupe
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { data, error } = await supabase
    .from("challenges")
    .select(
      `
      id,
      title,
      description,
      type,
      start_date,
      end_date,
      sport_metric,
      sport_goal,
      created_at,
      creator:profiles!challenges_creator_id_fkey (id, username),
      participants:challenge_participants (
        user:profiles (id, username, avatar_url)
      )
    `,
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ challenges: data });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const {
    group_id,
    title,
    description,
    type,
    duration_days,
    sport_metric,
    sport_goal,
  } = await request.json();

  const today = new Date().toISOString().split("T")[0];

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      group_id,
      creator_id: user.id,
      title,
      description,
      type,
      start_date: today,
      end_date: today, // ignoré pour daily_question
      duration_days: type === "daily_question" ? duration_days : null,
      ...(type === "sport" && { sport_metric, sport_goal }),
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Si daily_question → ajouter tous les membres du groupe automatiquement
  if (type === "daily_question") {
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", group_id);

    if (members?.length) {
      await supabase.from("challenge_participants").insert(
        members.map((m) => ({
          challenge_id: challenge.id,
          user_id: m.user_id,
        })),
      );
    }
  } else {
    // Sport → juste le créateur
    await supabase.from("challenge_participants").insert({
      challenge_id: challenge.id,
      user_id: user.id,
    });
  }

  // Le créateur rejoint automatiquement le défi
  await supabase.from("challenge_participants").insert({
    challenge_id: challenge.id,
    user_id: user.id,
  });

  return NextResponse.json({ challenge }, { status: 201 });
}
