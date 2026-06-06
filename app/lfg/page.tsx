import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { FiPlus, FiUsers, FiMonitor, FiMic, FiGlobe } from "react-icons/fi";
import { SiDiscord } from "react-icons/si";
import { LfgPost } from "@/types/database";

const PLATFORMS = ["All", "PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Cross-platform"];
const REGIONS = ["All", "NA", "EU", "ASIA", "SA", "OCE", "AF"];

async function getLfgPosts(platform?: string, region?: string) {
  let query = supabase
    .from("lfg_posts")
    .select("*, profiles(username, avatar_url)")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(30);

  if (platform && platform !== "All") query = query.eq("platform", platform);
  if (region && region !== "All") query = query.eq("region", region);

  const { data } = await query;
  return data || [];
}

interface LfgPageProps {
  searchParams: { platform?: string; region?: string };
}

const PLATFORM_ICONS: Record<string, string> = {
  PC: "🖥️", PlayStation: "🎮", Xbox: "🟢", "Nintendo Switch": "🔴", Mobile: "📱", "Cross-platform": "🌐",
};

export default async function LfgPage({ searchParams }: LfgPageProps) {
  const posts = await getLfgPosts(searchParams.platform, searchParams.region);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl text-text tracking-wide">FIND TEAMMATES</h1>
          <p className="text-text-dim text-sm mt-0.5">Looking for group — find players for any game</p>
        </div>
        <Link
          href="/lfg/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim text-white text-sm font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all"
        >
          <FiPlus /> Post LFG
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-dim text-xs font-mono uppercase tracking-widest flex items-center gap-1">
            <FiMonitor className="w-3 h-3" /> Platform:
          </span>
          {PLATFORMS.map((p) => (
            <Link
              key={p}
              href={`/lfg?platform=${p}&region=${searchParams.region || "All"}`}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                (searchParams.platform || "All") === p
                  ? "bg-accent text-white"
                  : "bg-panel border border-border text-text-dim hover:text-text"
              }`}
            >
              {PLATFORM_ICONS[p] || ""} {p}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-text-dim text-xs font-mono uppercase tracking-widest flex items-center gap-1">
          <FiGlobe className="w-3 h-3" /> Region:
        </span>
        {REGIONS.map((r) => (
          <Link
            key={r}
            href={`/lfg?platform=${searchParams.platform || "All"}&region=${r}`}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              (searchParams.region || "All") === r
                ? "bg-blue text-white"
                : "bg-panel border border-border text-text-dim hover:text-text"
            }`}
          >
            {r}
          </Link>
        ))}
      </div>

      {/* LFG Grid */}
      {posts.length === 0 ? (
        <div className="bg-panel border border-border rounded-2xl p-12 text-center">
          <p className="text-text-dim text-lg mb-2">No active LFG posts</p>
          <p className="text-text-dim text-sm mb-6">Be the first to post!</p>
          <Link href="/lfg/new" className="px-6 py-2.5 bg-accent text-white font-semibold rounded-xl shadow-glow">
            Post LFG
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className="bg-panel border border-border hover:border-accent/30 rounded-2xl p-5 transition-all flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{PLATFORM_ICONS[post.platform] || "🎮"}</span>
                    <span className="text-xs font-mono text-text-dim bg-surface px-2 py-0.5 rounded-full">
                      {post.platform}
                    </span>
                    <span className="text-xs font-mono text-text-dim bg-surface px-2 py-0.5 rounded-full">
                      {post.region}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text leading-tight">{post.title}</h3>
                  <p className="text-accent text-xs font-mono mt-0.5">{post.game}</p>
                </div>
              </div>

              <p className="text-text-dim text-sm leading-relaxed line-clamp-3">{post.description}</p>

              {/* Details */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-dim">
                  <FiUsers className="w-3 h-3" />
                  {post.players_current}/{post.players_needed + post.players_current} players
                </span>
                {post.rank && (
                  <span className="text-xs bg-gold/10 text-gold border border-gold/20 rounded-lg px-2 py-1">
                    🏅 {post.rank}
                  </span>
                )}
                {post.mic_required && (
                  <span className="flex items-center gap-1 text-xs bg-blue/10 text-blue border border-blue/20 rounded-lg px-2 py-1">
                    <FiMic className="w-3 h-3" /> Mic req.
                  </span>
                )}
                {post.game_mode && (
                  <span className="text-xs bg-surface border border-border rounded-lg px-2 py-1 text-text-dim">
                    {post.game_mode}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {post.profiles?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs text-text-dim">{post.profiles?.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  {post.discord_server && (
                    <a
                      href={`https://discord.gg/${post.discord_server}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20 rounded-lg hover:bg-[#5865f2]/20 transition-colors"
                    >
                      <SiDiscord className="w-3 h-3" /> Join
                    </a>
                  )}
                  <span className="text-text-dim text-xs">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
