// app/register/page.tsx
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[100dvh] bg-[#fceee9] relative overflow-hidden">
      {/* subtle radial accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 60rem at 110% -10%, #f8d3c5 0%, transparent 50%)",
        }}
      />
      <main className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left panel (hidden on small) */}
          <aside className="hidden lg:flex flex-col justify-center rounded-3xl border border-[#e8dcd7] bg-white/60 backdrop-blur-sm p-12 shadow-sm">
            <h1 className="text-4xl font-semibold tracking-tight text-[#667b68]">
              Forked
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#667b68]/80">
              Save recipes you love, share your creations, and discover dishes
              from other home cooks.
            </p>
            <div className="mt-10 h-2 w-24 rounded-full bg-[#a3b899]" />
          </aside>

          {/* Right panel (form) */}
          <section className="flex items-center">
            <div className="w-full rounded-3xl border border-[#e8dcd7] bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-[#667b68]">
                  Create your account
                </h2>
                <p className="mt-1 text-sm text-[#667b68]/70">
                  Start saving and sharing recipes in seconds.
                </p>
              </div>
              <RegisterForm />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
