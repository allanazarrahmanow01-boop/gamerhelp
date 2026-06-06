"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { FiArrowLeft, FiSave } from "react-icons/fi";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "" });

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("username, bio")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (data) setForm({ username: data.username || "", bio: data.bio || "" });
      });
  }, [session]);

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSave = async () => {
    if (!form.username.trim()) { toast.error("Username is required"); return; }
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ username: form.username.trim(), bio: form.bio.trim(), updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated!");
    router.push("/profile");
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/profile" className="flex items-center gap-1.5 text-text-dim hover:text-text text-sm mb-6 w-fit">
        <FiArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-panel">
        <div className="px-6 py-4 border-b border-border">
          <h1 className="font-display text-2xl text-text tracking-wide">SETTINGS</h1>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Your username" maxLength={30}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell the community about yourself..." rows={4} maxLength={200}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-dim focus:border-accent/60 focus:outline-none transition-colors resize-none" />
            <p className="text-text-dim text-xs mt-1">{form.bio.length}/200</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/profile" className="px-4 py-2 text-text-dim hover:text-text text-sm transition-colors">Cancel</Link>
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white font-semibold rounded-xl shadow-glow-sm transition-all disabled:opacity-60">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
