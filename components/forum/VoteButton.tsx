"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { FiArrowUp } from "react-icons/fi";

interface VoteButtonProps {
  postId: string;
  initialVotes: number;
  type: "post" | "reply";
}

export function VoteButton({ postId, initialVotes, type }: VoteButtonProps) {
  const { data: session } = useSession();
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!session) { toast.error("Sign in to vote"); return; }
    if (voted || loading) return;

    setLoading(true);
    const table = type === "post" ? "posts" : "replies";

    const { error } = await supabase
      .from("votes")
      .insert({ user_id: session.user.id, target_id: postId, target_type: type, value: 1 });

    if (!error) {
      await supabase.from(table).update({ upvotes: votes + 1 }).eq("id", postId);
      setVotes(votes + 1);
      setVoted(true);
    } else if (error.code === "23505") {
      toast.error("You already voted");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleVote}
      disabled={voted || loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
        voted
          ? "bg-accent/10 text-accent border border-accent/30"
          : "bg-surface hover:bg-panel text-text-dim hover:text-text border border-border"
      } disabled:cursor-not-allowed`}
    >
      <FiArrowUp className="w-4 h-4" />
      {votes}
    </button>
  );
}
