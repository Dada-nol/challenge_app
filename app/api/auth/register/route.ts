import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, username } = await request.json();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Créer le compte auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 2. Créer le profil lié
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user!.id,
    username,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}
