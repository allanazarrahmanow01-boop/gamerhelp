import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FiArrowLeft, FiMessageSquare, FiTrendingUp, FiEye } from "react-icons/fi";
import { ReplySection } from "@/components/forum/ReplySection";
import { VoteButton } from "@/components/forum/VoteButton";

interface PostPageProps {
  params: { id: string };
}

async function getPost(id: string) {
  const { data } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url, reputation), categories(name, slug, icon)")
    .eq("id", id)
    .single();
  return data;
}

async function getReplies(postId: string) {
  const { data } = await supabase
    .from("replies")
    .select("*, profiles(username, avatar_url, reputation)")
    .eq("post_id", postId)
    .order("is_accepted", { ascending: false })
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: true });
  return data || [];
}

export default async function PostPage({ params }: PostPageProps) {
  const [post, replies] = await Promise.all([getPost(params.id), getReplies(params.id)]);

  if (!post) notFound();

  // Increment view count
  await supabase.from("posts").update({ views: post.views + 1 }).eq("id", params.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/forum" className="flex items-center gap-1.5 text-text-dim hover:text-text text-sm mb-6 w-fit">
        <FiArrowLeft className="w-4 h-4" /> Back to Forum
      </Link>

      {/* Post */}
      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-panel mb-6">
        <div className="p-6">
          {/* Meta tags */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {post.is_solved && (
              <span className="text-sm px-2.5 py-1 bg-green/10 text-green border border-green/20 rounded-full font-mono font-semibold">
                ✓ Solved
              </span>
            )}
            {post.categories && (
              <span className="text-xs px-2 py-1 bg-surface rounded-full text-text-dim font-mono">
                {post.categories.icon} {post.categories.name}
              </span>
            )}
            {post.game_tag && (
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full font-mono">
                {post.game_tag}
              </span>
            )}
            {post.tags?.map((tag: string) => (
              <span key={tag} className="text-xs px-2 py-1 bg-surface text-text-dim rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-text mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              {post.profiles?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <span className="text-sm font-semibold text-text">{post.profiles?.username}</span>
              <span className="text-text-dim text-xs ml-2">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs text-text-dim">
              <span className="flex items-center gap-1">
                <FiEye className="w-3 h-3" /> {post.views}
              </span>
              <span className="flex items-center gap-1">
                <FiMessageSquare className="w-3 h-3" /> {post.reply_count} replies
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="post-content text-text leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Vote */}
          <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
            <VoteButton postId={post.id} initialVotes={post.upvotes} type="post" />
          </div>
        </div>
      </div>

      {/* Replies */}
      <ReplySection postId={post.id} replies={replies} authorId={post.author_id} isSolved={post.is_solved} />
    </div>
  );
}
