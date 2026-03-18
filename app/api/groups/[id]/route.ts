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

  // Vérifier que l'user est bien membre du groupe
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", id)
    .eq("user_id", user.id)
    .single();

  if (!membership)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  // Récupérer le groupe avec ses membres et ses défis
  const { data: group, error } = await supabase
    .from("groups")
    .select(
      `
      id,
      name,
      emoji,
      invite_code,
      created_at,
      creator:profiles!groups_creator_id_fkey (id, username),
      members:group_members (
        role,
        joined_at,
        user:profiles (id, username, avatar_url)
      ),
      challenges (
        id,
        title,
        type,
        start_date,
        end_date,
        sport_metric,
        sport_goal
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ group });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  // Seul l'admin peut supprimer
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { error } = await supabase.from("groups").delete().eq("id", params.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
