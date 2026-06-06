import { supabase } from "@/lib/supabase";
import { FiAward, FiMessageSquare, FiTrendingUp } from "react-icons/fi";

async function getLeaderboard() {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, reputation, provider")
    .order("reputation", { ascending: false })
    .limit(50);
  return data || [];
}

async function getTopPosters() {
  const { data } = await supabase
    .from("posts")
    .select("author_id, profiles(username, avatar_url)")
    .limit(100);

  if (!data) return [];
  const counts: Record<string, { username: string; count: number }> = {};
  data.forEach((p: any) => {
    const id = p.author_id;
    if (!counts[id]) counts[id] = { username: p.profiles?.username, count: 0 };
    counts[id].count++;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id, v]) => ({ id, ...v }));
}

const RANK_STYLES = [
  { bg: "bg-gold/10 border-gold/40", text: "text-gold", medal: "🥇" },
  { bg: "bg-text-dim/10 border-text-dim/40", text: "text-text-dim", medal: "🥈" },
  { bg: "bg-[#cd7f32]/10 border-[#cd7f32]/40", text: "text-[#cd7f32]", medal: "🥉" },
];

export default async function LeaderboardPage() {
  const [leaders, topPosters] = await Promise.all([getLeaderboard(), getTopPosters()]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-text tracking-wide flex items-center gap-3">
          <FiAward className="text-gold" /> LEADERBOARD
        </h1>
        <p className="text-text-dim text-sm mt-1">Top contributors in the GamerHelp community</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Reputation board */}
        <div>
          <h2 className="font-display text-xl text-text tracking-wide mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-accent" /> Top Reputation
          </h2>
          <div className="space-y-2">
            {leaders.map((user: any, i) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  i < 3 ? RANK_STYLES[i].bg : "bg-panel border-border"
                }`}
              >
                <span className="w-8 text-center font-display text-lg">
                  {i < 3 ? RANK_STYLES[i].medal : <span className="text-text-dim text-sm font-mono">#{i + 1}</span>}
                </span>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text text-sm truncate">{user.username}</div>
                  <div className="text-text-dim text-xs capitalize">{user.provider}</div>
                </div>
                <div className={`font-display text-lg ${i < 3 ? RANK_STYLES[i].text : "text-text-dim"}`}>
                  {user.reputation}
                  <span className="text-xs font-body ml-1 opacity-60">rep</span>
                </div>
              </div>
            ))}
            {leaders.length === 0 && (
              <p className="text-text-dim text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Top posters */}
        <div>
          <h2 className="font-display text-xl text-text tracking-wide mb-4 flex items-center gap-2">
            <FiMessageSquare className="text-blue" /> Most Active
          </h2>
          <div className="space-y-2">
            {topPosters.map((user: any, i) => (
              <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                i < 3 ? RANK_STYLES[i].bg : "bg-panel border-border"
              }`}>
                <span className="w-8 text-center font-display text-lg">
                  {i < 3 ? RANK_STYLES[i].medal : <span className="text-text-dim text-sm font-mono">#{i + 1}</span>}
                </span>
                <div className="w-8 h-8 rounded-full bg-blue/20 flex items-center justify-center text-blue text-sm font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text text-sm truncate">{user.username}</div>
                </div>
                <div className={`font-display text-lg ${i < 3 ? RANK_STYLES[i].text : "text-text-dim"}`}>
                  {user.count}
                  <span className="text-xs font-body ml-1 opacity-60">posts</span>
                </div>
              </div>
            ))}
            {topPosters.length === 0 && (
              <p className="text-text-dim text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
