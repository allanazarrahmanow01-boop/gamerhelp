"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Cross-platform"];
const REGIONS = ["NA", "EU", "ASIA", "SA", "OCE", "AF", "Global"];

export default function NewLfgPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    game: "",
    game_mode: "",
    title: "",
    description: "",
    platform: "PC",
    region: "NA",
    players_needed: "1",
    rank: "",
    mic_required: false,
    discord_server: "",
  });

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-text mb-3">Sign in to post LFG</h2>
        <Link href="/auth/signin" className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-glow">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.game.trim() || !form.title.trim() || !form.description.trim()) {
      toast.error("Game, title, and description are required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("lfg_posts").insert({
      author_id: session.user.id,
      game: form.game.trim(),
      game_mode: form.game_mode.trim() || null,
      title: form.title.trim(),
      description: form.description.trim(),
      platform: form.platform as any,
      region: form.region,
      players_needed: parseInt(form.players_needed),
      rank: form.rank.trim() || null,
      mic_required: form.mic_required,
      discord_server: form.discord_server.trim() || null,
    });

    setLoading(false);
    if (error) { toast.error("Failed to create LFG post"); return; }

    toast.success("LFG post created!");
    router.push("/lfg");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/lfg" className="flex items-center gap-1.5 text-text-dim hover:text-text text-sm mb-6 w-fit">
        <FiArrowLeft className="w-4 h-4" /> Back to LFG
      </Link>

      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-panel">
        <div className="px-6 py-4 border-b border-border">
          <h1 className="font-display text-2xl text-text tracking-wide">POST LFG</h1>
          <p className="text-text-dim text-sm">Find teammates for your next session</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Game <span className="text-accent">*</span></label>
              <input value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
                placeholder="e.g. Valorant, Elden Ring..." className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Game Mode</label>
              <input value={form.game_mode} onChange={(e) => setForm({ ...form, game_mode: e.target.value })}
                placeholder="e.g. Ranked, Casual, Co-op..." className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Title <span className="text-accent">*</span></label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Looking for ranked teammates for Valorant..." className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Description <span className="text-accent">*</span></label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you're looking for, your playstyle, schedule, requirements..." rows={4}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:border-accent/60 focus:outline-none transition-colors">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Region</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:border-accent/60 focus:outline-none transition-colors">
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Players Needed</label>
              <input type="number" min="1" max="20" value={form.players_needed}
                onChange={(e) => setForm({ ...form, players_needed: e.target.value })}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text focus:border-accent/60 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Rank / Skill Level</label>
              <input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })}
                placeholder="e.g. Diamond, Veteran..." className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Discord Server (optional)</label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-surface border border-r-0 border-border rounded-l-xl text-text-dim text-sm">discord.gg/</span>
              <input value={form.discord_server} onChange={(e) => setForm({ ...form, discord_server: e.target.value })}
                placeholder="your-invite-code" className="flex-1 bg-surface border border-border rounded-r-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-5 rounded-full transition-colors relative ${form.mic_required ? "bg-accent" : "bg-muted"}`}
              onClick={() => setForm({ ...form, mic_required: !form.mic_required })}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.mic_required ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-semibold text-text">Mic required</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/lfg" className="px-4 py-2 text-text-dim hover:text-text text-sm transition-colors">Cancel</Link>
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all disabled:opacity-60">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Post LFG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
