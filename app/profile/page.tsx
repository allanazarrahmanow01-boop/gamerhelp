import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FiMessageSquare, FiTrendingUp, FiAward, FiEdit2 } from "react-icons/fi";
import { SiSteam, SiDiscord } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";

async function getProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

async function getUserPosts(userId: string) {
  const { data } = await supabase
    .from("posts")
    .select("id, title, upvotes, reply_count, created_at, is_solved, game_tag")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

const PROVIDER_BADGE: Record<string, JSX.Element> = {
  google: <><FcGoogle className="w-3.5 h-3.5" /> Google</>,
  discord: <><SiDiscord className="w-3.5 h-3.5 text-[#5865f2]" /> Discord</>,
  steam: <><SiSteam className="w-3.5 h-3.5 text-[#a0c4e4]" /> Steam</>,
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const [profile, posts] = await Promise.all([
    getProfile(session.user.id),
    getUserPosts(session.user.id),
  ]);

  if (!profile) redirect("/auth/signin");

  const solvedCount = posts.filter((p: any) => p.is_solved).length;
  const totalUpvotes = posts.reduce((sum: number, p: any) => sum + p.upvotes, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-panel border border-border rounded-2xl p-6 shadow-panel sticky top-20">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-3xl font-display mx-auto mb-3 border-2 border-accent/30">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  profile.username?.[0]?.toUpperCase()
                )}
              </div>
              <h2 className="font-display text-2xl text-text tracking-wide">{profile.username}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-text-dim bg-surface px-2.5 py-1 rounded-full w-fit mx-auto">
                {PROVIDER_BADGE[profile.provider || ""] || null}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-text-dim text-sm text-center mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Rep", value: profile.reputation, icon: <FiAward className="text-gold" /> },
                { label: "Posts", value: posts.length, icon: <FiMessageSquare className="text-blue" /> },
                { label: "Upvotes", value: totalUpvotes, icon: <FiTrendingUp className="text-green" /> },
              ].map((s) => (
                <div key={s.label} className="bg-surface rounded-xl p-2.5 text-center">
                  <div className="flex justify-center mb-0.5">{s.icon}</div>
                  <div className="font-display text-lg text-text">{s.value}</div>
                  <div className="text-text-dim text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-text-dim text-center mb-4">
              Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
            </div>

            <Link
              href="/profile/settings"
              className="flex items-center justify-center gap-2 w-full py-2 bg-surface hover:bg-border border border-border rounded-xl text-sm text-text-dim hover:text-text transition-colors"
            >
              <FiEdit2 className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Posts */}
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-text tracking-wide mb-4">MY POSTS</h2>

          {posts.length === 0 ? (
            <div className="bg-panel border border-border rounded-2xl p-8 text-center">
              <p className="text-text-dim mb-3">You haven't posted yet</p>
              <Link href="/forum/new" className="text-accent hover:underline text-sm">
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="flex items-center gap-3 bg-panel border border-border hover:border-accent/30 rounded-xl p-4 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.is_solved && (
                        <span className="text-xs px-1.5 py-0.5 bg-green/10 text-green border border-green/20 rounded font-mono">
                          ✓ Solved
                        </span>
                      )}
                      {post.game_tag && (
                        <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded font-mono">
                          {post.game_tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-text group-hover:text-accent transition-colors text-sm truncate">
                      {post.title}
                    </h3>
                    <p className="text-text-dim text-xs mt-0.5">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-dim">
                    <span className="flex items-center gap-1">
                      <FiTrendingUp className="w-3 h-3" /> {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMessageSquare className="w-3 h-3" /> {post.reply_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
