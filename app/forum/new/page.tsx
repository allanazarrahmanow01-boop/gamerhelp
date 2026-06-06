"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const CATEGORIES = [
  { id: 1, name: "General Help", icon: "🎮" },
  { id: 2, name: "Build Advice", icon: "⚔️" },
  { id: 3, name: "Boss Fights", icon: "💀" },
  { id: 4, name: "Glitches & Bugs", icon: "🐛" },
  { id: 5, name: "Achievements", icon: "🏆" },
  { id: 6, name: "Story & Lore", icon: "📖" },
  { id: 7, name: "Technical Issues", icon: "🔧" },
  { id: 8, name: "Game Recommendations", icon: "⭐" },
];

export default function NewPostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    game_tag: "",
    category_id: "",
    tags: "",
  });

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-text mb-3">Sign in to post</h2>
        <p className="text-text-dim mb-6">You need an account to create posts.</p>
        <Link href="/auth/signin" className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-glow">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: session.user.id,
        title: form.title.trim(),
        content: form.content.trim(),
        game_tag: form.game_tag.trim() || null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        tags,
      })
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      toast.error("Failed to create post");
      return;
    }

    toast.success("Post created!");
    router.push(`/forum/${data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/forum" className="flex items-center gap-1.5 text-text-dim hover:text-text text-sm mb-6 w-fit">
        <FiArrowLeft className="w-4 h-4" /> Back to Forum
      </Link>

      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-panel">
        <div className="px-6 py-4 border-b border-border">
          <h1 className="font-display text-2xl text-text tracking-wide">NEW POST</h1>
          <p className="text-text-dim text-sm">Ask a question, share a tip, or start a discussion</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Title <span className="text-accent">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What do you need help with?"
              maxLength={200}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors"
            />
            <p className="text-text-dim text-xs mt-1">{form.title.length}/200</p>
          </div>

          {/* Category & Game */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:border-accent/60 focus:outline-none transition-colors"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Game Tag</label>
              <input
                value={form.game_tag}
                onChange={(e) => setForm({ ...form, game_tag: e.target.value })}
                placeholder="e.g. Elden Ring, Fortnite..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Content <span className="text-accent">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Describe your question or tip in detail..."
              rows={10}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors resize-none font-body"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Tags</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="boss fight, strategy, tips (comma separated)"
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/forum"
              className="px-4 py-2 text-text-dim hover:text-text text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
