import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addXP, XP_REWARDS } from "@/utils/xp";

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

  const { question_id, content } = await request.json();

  // Vérifier que l'user est participant du défi
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

  // Vérifier qu'il n'a pas déjà répondu
  const { data: existing } = await supabase
    .from("daily_answers")
    .select("id")
    .eq("question_id", question_id)
    .eq("author_id", user.id)
    .single();

  if (existing)
    return NextResponse.json({ error: "Déjà répondu" }, { status: 400 });

  const { data: answer, error } = await supabase
    .from("daily_answers")
    .insert({
      question_id,
      author_id: user.id,
      content,
    })
    .select()
    .single();

  await addXP(supabase, user.id, XP_REWARDS.join_group);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ answer }, { status: 201 });
}
