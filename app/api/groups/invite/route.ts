import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addXP, XP_REWARDS } from "@/utils/xp";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { invite_code } = await request.json();

  const { data: group, error } = await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", invite_code)
    .single();

  if (error || !group)
    return NextResponse.json({ error: "Code invalide" }, { status: 404 });

  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existing)
    return NextResponse.json({ error: "Déjà membre" }, { status: 400 });

  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
  });

  await addXP(supabase, user.id, XP_REWARDS.join_group);

  return NextResponse.json({ success: true });
}
