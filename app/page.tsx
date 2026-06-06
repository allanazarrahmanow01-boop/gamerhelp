import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FiArrowRight, FiUsers, FiMessageSquare, FiTrendingUp, FiZap } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

async function getStats() {
  const [{ count: posts }, { count: users }, { count: lfg }] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("lfg_posts").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);
  return { posts: posts || 0, users: users || 0, lfg: lfg || 0 };
}

async function getRecentPosts() {
  const { data } = await supabase
    .from("posts")
    .select("id, title, game_tag, upvotes, reply_count, created_at, is_solved, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}

async function getCategories() {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("post_count", { ascending: false });
  return data || [];
}

export default async function HomePage() {
  const [stats, recentPosts, categories] = await Promise.all([
    getStats(),
    getRecentPosts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-bg-pattern bg-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glow border border-accent/30 text-accent text-xs font-mono mb-6 animate-pulse-glow">
            <FiZap className="w-3 h-3" />
            <span>The gaming community that actually helps</span>
          </div>

          <h1 className="font-display text-6xl sm:text-8xl text-text mb-6 glow-text leading-none">
            GAMER<span className="text-accent">HELP</span>
          </h1>

          <p className="text-text-dim text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
            Stuck on a boss? Need a build? Looking for teammates?
            Get real answers from real gamers.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/forum"
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow hover:shadow-glow transition-all"
            >
              Browse Forum <FiArrowRight />
            </Link>
            <Link
              href="/lfg"
              className="flex items-center gap-2 px-6 py-3 bg-surface hover:bg-panel text-text font-semibold rounded-xl border border-border transition-all"
            >
              Find Teammates <FiUsers />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: "Members", value: stats.users.toLocaleString(), icon: <FiUsers /> },
              { label: "Posts", value: stats.posts.toLocaleString(), icon: <FiMessageSquare /> },
              { label: "Active LFG", value: stats.lfg.toLocaleString(), icon: <FiTrendingUp /> },
            ].map((s) => (
              <div key={s.label} className="bg-panel/60 border border-border rounded-xl p-4">
                <div className="text-accent mb-1 flex justify-center">{s.icon}</div>
                <div className="font-display text-2xl text-text">{s.value}</div>
                <div className="text-text-dim text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-text tracking-wide">RECENT POSTS</h2>
            <Link href="/forum" className="text-accent text-sm hover:underline flex items-center gap-1">
              View all <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="bg-panel border border-border rounded-xl p-8 text-center text-text-dim">
              No posts yet.{" "}
              <Link href="/forum/new" className="text-accent hover:underline">
                Be the first!
              </Link>
            </div>
          ) : (
            recentPosts.map((post: any) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="block bg-panel border border-border hover:border-accent/40 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {post.is_solved && (
                        <span className="text-xs px-2 py-0.5 bg-green/10 text-green border border-green/20 rounded-full font-mono">
                          ✓ Solved
                        </span>
                      )}
                      {post.game_tag && (
                        <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full font-mono">
                          {post.game_tag}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-text group-hover:text-accent transition-colors truncate">
                      {post.title}
                    </h3>
                    <p className="text-text-dim text-xs mt-1">
                      by {post.profiles?.username} ·{" "}
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-dim shrink-0">
                    <span className="flex items-center gap-1">
                      <FiTrendingUp className="w-3 h-3" /> {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMessageSquare className="w-3 h-3" /> {post.reply_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Categories */}
        <div>
          <h2 className="font-display text-2xl text-text tracking-wide mb-4">CATEGORIES</h2>
          <div className="space-y-2">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/forum?category=${cat.slug}`}
                className="flex items-center gap-3 bg-panel border border-border hover:border-accent/40 rounded-xl p-3 transition-all group"
              >
                <span className="text-xl w-8 text-center">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text group-hover:text-accent transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-xs text-text-dim">{cat.post_count} posts</div>
                </div>
                <FiArrowRight className="text-text-dim group-hover:text-accent w-4 h-4 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden bg-panel border border-accent/20 rounded-2xl p-8 md:p-12 text-center shadow-glow">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl text-text mb-3">
              READY TO <span className="text-accent">HELP?</span>
            </h2>
            <p className="text-text-dim max-w-md mx-auto mb-6">
              Join thousands of gamers helping each other. Answer questions, find teammates, build your reputation.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow transition-all"
            >
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
