"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/validation/auth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Zod schema 
const schema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const { login: setUserInContext } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", remember: true },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      // 1) Login to get tokens
      const r = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: values.username.trim(), // username or email
          password: values.password,
        }),
        // For login no auto-refresh; show 401 instead
        retryOn401: false,
      });

      if (!r.ok) {
        const errBody = await r.json().catch(() => ({} as any));
        throw new Error(errBody?.detail ?? "Invalid credentials");
      }

      const data: {
        access_token: string;
        refresh_token: string;
        token_type: string;
      } = await r.json();

      // 2) Store tokens (respect the "remember me" choice)
      setTokens(data.access_token, data.refresh_token, values.remember ?? true);

      // 3) Fetch user profile and push into context
      const meRes = await apiFetch("/auth/me", { retryOn401: false });
      if (!meRes.ok) throw new Error("Could not load profile");
      const me = await meRes.json();
      setUserInContext(me);

      toast.success("Welcome back!");
      router.push("/"); 
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="username">Username or Email</Label>
        <Input id="username" {...register("username")} />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input id="remember" type="checkbox" {...register("remember")} />
        <Label htmlFor="remember">Remember me</Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
