import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Forked • Login",
};

export default function LoginPage() {
  return (
    <main
      className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4"
      style={{ backgroundColor: "#fceee9" }} // blush
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl shadow-lg border p-8"
          style={{ backgroundColor: "#ffffff", borderColor: "#dde6d5" }} // white card, sage border
        >
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ color: "#667b68" }} // forest
          >
            Welcome back!
          </h1>
          <p className="text-sm mb-6" style={{ color: "#667b68" }}>
            Log in to continue to Forked
          </p>

          <LoginForm />

          <p className="mt-6 text-sm" style={{ color: "#667b68" }}>
            Don’t have an account?{" "}
            <a
              href="/register"
              className="underline underline-offset-4"
              style={{ color: "#a3b899" }} // sage
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
