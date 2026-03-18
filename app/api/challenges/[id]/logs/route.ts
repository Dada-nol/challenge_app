import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addXP, XP_REWARDS } from "@/utils/xp";

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
    .from("sport_logs")
    .select(
      `
      id,
      value,
      note,
      logged_at,
      user:profiles!sport_logs_user_id_fkey (id, username, avatar_url)
    `,
    )
    .eq("challenge_id", id)
    .order("logged_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ logs: data });
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

  const { value, note } = await request.json();

  // Vérifier que l'user est participant
  const { data: participant } = await supabase
    .from("challenge_participants")
    .select("id")
    .eq("challenge_id", id)
    .eq("user_id", user.id)
    .single();

  if (!participant)
    return NextResponse.json(
      { error: "Tu n'es pas participant" },
      { status: 403 },
    );

  const { data: log, error } = await supabase
    .from("sport_logs")
    .insert({
      challenge_id: id,
      user_id: user.id,
      value,
      note,
    })
    .select()
    .single();

  await addXP(supabase, user.id, XP_REWARDS.join_group);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ log }, { status: 201 });
}
