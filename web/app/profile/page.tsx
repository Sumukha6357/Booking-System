"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { User, Mail, Shield, Save, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type UserProfile = {
  id: string;
  email: string;
  role: string;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    try {
      const data = await apiFetch<UserProfile>("/api/users/profile");
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!profile || !confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "DELETE"
      });
      localStorage.removeItem("authToken");
      localStorage.removeItem("tenantId");
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to delete account:", err);
      setMessage({ type: "error", text: "Failed to delete account" });
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl space-y-8 p-8 md:p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-surface-mid"></div>
          <div className="h-24 w-full rounded bg-surface-mid"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-8 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-ink-muted">Manage your account settings and preferences.</p>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 ${
            message.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-rose-400/20 bg-rose-400/10 text-rose-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <section className="rounded-2xl border border-border bg-surface-low p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-surface-mid p-3">
            <User size={24} className="text-ink-muted" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Account Information</h2>
            <p className="text-sm text-ink-muted">Your account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">First Name</label>
              <input
                type="text"
                value={profile?.firstName || ""}
                onChange={(e) => setProfile(p => p ? { ...p, firstName: e.target.value } : null)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Last Name</label>
              <input
                type="text"
                value={profile?.lastName || ""}
                onChange={(e) => setProfile(p => p ? { ...p, lastName: e.target.value } : null)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2">
              <Mail size={14} />
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none opacity-60"
            />
            <p className="mt-1 text-xs text-ink-muted">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2">
              <Shield size={14} />
              Role
            </label>
            <input
              type="text"
              value={profile?.role || ""}
              disabled
              className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none opacity-60"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2">
              <Shield size={14} />
              Phone
            </label>
            <input
              type="text"
              value={profile?.phone || ""}
              onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
              className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-low p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-surface-mid p-3">
            <Save size={24} className="text-ink-muted" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Account Status</h2>
            <p className="text-sm text-ink-muted">Manage your account visibility</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-mid/50 p-4">
          <div>
            <div className="font-medium">Account Enabled</div>
            <div className="text-xs text-ink-muted">Your account is currently {profile?.enabled ? "active" : "disabled"}</div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={profile?.enabled ?? false}
              onChange={(e) => setProfile(p => p ? { ...p, enabled: e.target.checked } : null)}
              className="sr-only peer"
            />
            <div className="peer h-6 w-11 rounded-full bg-surface-mid after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>
      </section>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-canvas transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-6 py-3 text-sm font-bold text-rose-400 transition-all hover:bg-rose-400/20 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          Delete Account
        </button>
      </div>
    </main>
  );
}
