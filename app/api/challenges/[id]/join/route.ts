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

  const { data: existing } = await supabase
    .from("challenge_participants")
    .select("id")
    .eq("challenge_id", id)
    .eq("user_id", user.id)
    .single();

  if (existing)
    return NextResponse.json({ error: "Déjà participant" }, { status: 400 });

  const { error } = await supabase
    .from("challenge_participants")
    .insert({ challenge_id: id, user_id: user.id });

  await addXP(supabase, user.id, XP_REWARDS.join_group);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
