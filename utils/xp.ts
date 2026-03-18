import { SupabaseClient } from "@supabase/supabase-js";

export const XP_REWARDS = {
  join_challenge: 10,
  post_log: 20,
  post_question: 15,
  post_answer: 10,
  join_group: 5,
};

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export async function addXP(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
) {
  // Récupérer l'XP actuel
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const newXp = (profile.xp ?? 0) + amount;
  const newLevel = calculateLevel(newXp);

  await supabase
    .from("profiles")
    .update({ xp: newXp, level: newLevel })
    .eq("id", userId);
}
