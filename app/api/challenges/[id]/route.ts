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

  const { data: challenge, error } = await supabase
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
        joined_at,
        user:profiles (id, username, avatar_url)
      ),
      daily_questions (
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
      ),
      sport_logs (
        id,
        value,
        note,
        logged_at,
        user:profiles!sport_logs_user_id_fkey (id, username)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ challenge });
}

export async function DELETE(
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

  // Seul le créateur peut supprimer
  const { data: challenge } = await supabase
    .from("challenges")
    .select("creator_id")
    .eq("id", id)
    .single();

  if (!challenge || challenge.creator_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { error } = await supabase.from("challenges").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
