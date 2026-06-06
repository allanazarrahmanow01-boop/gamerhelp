"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FiCheck, FiMessageSquare } from "react-icons/fi";
import { VoteButton } from "./VoteButton";
import { Reply } from "@/types/database";

interface ReplySectionProps {
  postId: string;
  replies: (Reply & { profiles?: any })[];
  authorId: string;
  isSolved: boolean;
}

export function ReplySection({ postId, replies: initialReplies, authorId, isSolved }: ReplySectionProps) {
  const { data: session } = useSession();
  const [replies, setReplies] = useState(initialReplies);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReply = async () => {
    if (!content.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("replies")
      .insert({ post_id: postId, author_id: session!.user.id, content: content.trim() })
      .select("*, profiles(username, avatar_url, reputation)")
      .single();

    setLoading(false);
    if (error) { toast.error("Failed to post reply"); return; }

    setReplies([...replies, data]);
    setContent("");
    toast.success("Reply posted!");
  };

  const acceptAnswer = async (replyId: string) => {
    if (session?.user.id !== authorId) return;
    await supabase.from("replies").update({ is_accepted: false }).eq("post_id", postId);
    await supabase.from("replies").update({ is_accepted: true }).eq("id", replyId);
    await supabase.from("posts").update({ is_solved: true }).eq("id", postId);

    setReplies(replies.map((r) => ({ ...r, is_accepted: r.id === replyId })));
    toast.success("Marked as accepted answer!");
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-text tracking-wide mb-4 flex items-center gap-2">
        <FiMessageSquare className="text-accent" />
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h2>

      {/* Replies list */}
      <div className="space-y-3 mb-6">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`bg-panel border rounded-2xl p-5 shadow-panel ${
              reply.is_accepted ? "border-green/40 bg-green/5" : "border-border"
            }`}
          >
            {reply.is_accepted && (
              <div className="flex items-center gap-1.5 text-green text-xs font-mono font-semibold mb-3">
                <FiCheck className="w-3.5 h-3.5" /> Accepted Answer
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                {reply.profiles?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-text">{reply.profiles?.username}</span>
              <span className="text-text-dim text-xs">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="post-content text-text text-sm leading-relaxed whitespace-pre-wrap mb-4">
              {reply.content}
            </div>

            <div className="flex items-center gap-3">
              <VoteButton postId={reply.id} initialVotes={reply.upvotes} type="reply" />
              {session?.user.id === authorId && !isSolved && (
                <button
                  onClick={() => acceptAnswer(reply.id)}
                  className="flex items-center gap-1.5 text-xs text-text-dim hover:text-green transition-colors"
                >
                  <FiCheck className="w-3.5 h-3.5" /> Mark as Answer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {session ? (
        <div className="bg-panel border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-text mb-3">Your Reply</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your knowledge or ask a follow-up..."
            rows={5}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors resize-none mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={submitReply}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Post Reply
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-panel border border-border rounded-2xl p-6 text-center">
          <p className="text-text-dim mb-3">Sign in to reply</p>
          <Link href="/auth/signin" className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-xl shadow-glow-sm">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
