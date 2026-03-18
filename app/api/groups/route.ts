import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      group:groups (
        id,
        name,
        emoji,
        invite_code,
        created_at,
        creator:profiles!groups_creator_id_fkey (username)
      )
    `,
    )
    .eq("user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ groups: data.map((d) => d.group) });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { name, emoji } = await request.json();

  // Créer le groupe
  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, emoji, creator_id: user.id })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Ajouter le créateur comme membre admin
  await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
  });

  return NextResponse.json({ group }, { status: 201 });
}
