"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/validation/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegisterForm() {
  const router = useRouter();
  const { login: setUserInContext } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    username: "",
    email: "",
    password: "",
    remember: true, // default to remember; 
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // 1) Create account
      const r = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
        
        retryOn401: false,
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data?.detail || "Registration failed");
      }

      // 2) Immediately log in
      const rLogin = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: form.username.trim(), // login accepts username OR email
          password: form.password,
        }),
        retryOn401: false,
      });
      if (!rLogin.ok) {
        const data = await rLogin.json().catch(() => ({}));
        throw new Error(data?.detail || "Auto-login failed");
      }
      const tokens: {
        access_token: string;
        refresh_token: string;
        token_type: string;
      } = await rLogin.json();

      setTokens(tokens.access_token, tokens.refresh_token, form.remember);

      // 3) Fetch user and push into context
      const meRes = await apiFetch("/auth/me", { retryOn401: false });
      if (!meRes.ok) throw new Error("Could not load profile");
      const me = await meRes.json();
      setUserInContext(me);

      toast.success("Welcome to Forked! 🎉");
      router.push("/"); // go to home (or /dashboard)
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#667b68]">Username</label>
        <input
          required
          minLength={2}
          value={form.username}
          onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
          className="block w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 text-[#2b2b2b] outline-none transition focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          placeholder="yourname"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#667b68]">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          className="block w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 text-[#2b2b2b] outline-none transition focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#667b68]">Password</label>
        <input
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          className="block w-full rounded-xl border border-[#e6dfdd] bg-white px-4 py-3 text-[#2b2b2b] outline-none transition focus:border-[#a3b899] focus:ring-2 focus:ring-[#a3b899]/30"
          placeholder="••••••••"
        />
        <p className="text-xs text-[#667b68]/60">At least 6 characters.</p>
      </div>

      {/* Remember me (optional) */}
      <label className="flex items-center gap-2 text-sm text-[#667b68]">
        <input
          type="checkbox"
          checked={form.remember}
          onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
        />
        Remember me
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#667b68] px-4 py-3 font-medium text-white transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#a3b899]/40 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create account"}
      </button>

      <p className="text-center text-sm text-[#667b68]/75">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-[#667b68] underline underline-offset-4 hover:opacity-90"
        >
          Log in
        </a>
      </p>
    </form>
  );
}
