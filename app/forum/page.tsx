import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { FiMessageSquare, FiTrendingUp, FiEye, FiFilter, FiPlus } from "react-icons/fi";

interface ForumPageProps {
  searchParams: { category?: string; sort?: string; search?: string };
}

async function getPosts(category?: string, sort?: string, search?: string) {
  let query = supabase
    .from("posts")
    .select("id, title, game_tag, upvotes, reply_count, views, created_at, is_solved, is_pinned, profiles(username, avatar_url), categories(name, slug, icon, color)")
    .limit(30);

  if (category) query = query.eq("categories.slug", category);
  if (search) query = query.ilike("title", `%${search}%`);

  switch (sort) {
    case "hot":
      query = query.order("upvotes", { ascending: false });
      break;
    case "unanswered":
      query = query.eq("reply_count", 0);
      break;
    default:
      query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data } = await query;
  return data || [];
}

async function getCategories() {
  const { data } = await supabase.from("categories").select("*").order("post_count", { ascending: false });
  return data || [];
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const [posts, categories] = await Promise.all([
    getPosts(searchParams.category, searchParams.sort, searchParams.search),
    getCategories(),
  ]);

  const SORT_OPTIONS = [
    { value: "latest", label: "Latest" },
    { value: "hot", label: "🔥 Hot" },
    { value: "unanswered", label: "Unanswered" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl text-text tracking-wide">FORUM</h1>
          <p className="text-text-dim text-sm mt-0.5">Get help, share knowledge, level up</p>
        </div>
        <Link
          href="/forum/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dim text-white text-sm font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all"
        >
          <FiPlus /> New Post
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          {/* Search */}
          <form className="relative">
            <input
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search posts..."
              className="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors"
            />
          </form>

          {/* Categories */}
          <div className="bg-panel border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-text-dim text-xs font-mono uppercase tracking-widest">
              <FiFilter className="w-3 h-3" /> Categories
            </div>
            <div className="p-2">
              <Link
                href="/forum"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  !searchParams.category ? "bg-accent/10 text-accent" : "text-text-dim hover:text-text hover:bg-surface"
                }`}
              >
                All Posts
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/forum?category=${cat.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    searchParams.category === cat.slug
                      ? "bg-accent/10 text-accent"
                      : "text-text-dim hover:text-text hover:bg-surface"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-xs text-text-dim font-mono">{cat.post_count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="md:col-span-3">
          {/* Sort tabs */}
          <div className="flex items-center gap-1 mb-4 bg-panel border border-border rounded-xl p-1 w-fit">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/forum?sort=${opt.value}${searchParams.category ? `&category=${searchParams.category}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  (searchParams.sort || "latest") === opt.value
                    ? "bg-accent text-white"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          {/* Post list */}
          <div className="space-y-2">
            {posts.length === 0 ? (
              <div className="bg-panel border border-border rounded-xl p-12 text-center">
                <p className="text-text-dim mb-3">No posts yet</p>
                <Link href="/forum/new" className="text-accent hover:underline text-sm">
                  Create the first post
                </Link>
              </div>
            ) : (
              posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="flex items-start gap-4 bg-panel border border-border hover:border-accent/30 rounded-xl p-4 transition-all group"
                >
                  {/* Vote count */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[36px]">
                    <div className={`text-sm font-bold font-mono ${post.upvotes > 0 ? "text-green" : "text-text-dim"}`}>
                      {post.upvotes}
                    </div>
                    <div className="text-text-dim text-xs">votes</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {post.is_pinned && (
                        <span className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded font-mono">
                          📌 Pinned
                        </span>
                      )}
                      {post.is_solved && (
                        <span className="text-xs px-1.5 py-0.5 bg-green/10 text-green border border-green/20 rounded font-mono">
                          ✓ Solved
                        </span>
                      )}
                      {post.categories && (
                        <span className="text-xs px-1.5 py-0.5 bg-surface rounded font-mono text-text-dim">
                          {post.categories.icon} {post.categories.name}
                        </span>
                      )}
                      {post.game_tag && (
                        <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded font-mono">
                          {post.game_tag}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-text group-hover:text-accent transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-text-dim text-xs mt-1.5">
                      by{" "}
                      <span className="text-text">{post.profiles?.username}</span>{" "}
                      · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end gap-1 text-xs text-text-dim shrink-0">
                    <span className="flex items-center gap-1">
                      <FiMessageSquare className="w-3 h-3" /> {post.reply_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye className="w-3 h-3" /> {post.views}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
