"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, PlusCircle, Bell, Settings } from "lucide-react";

type Mode = "browse" | "me";

const NavItem = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
}) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 transition cursor-pointer",
        "hover:bg-[#dde6d5]/60 border border-transparent",
        active ? "bg-[#dde6d5] border-[#e6dfdd]" : "text-[#2b2b2b]",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 text-[#667b68]" />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

export function Sidebar({ mode }: { mode: Mode }) {
  return (
    <aside className="sticky top-0 h-[calc(100vh-2rem)] w-56 shrink-0 rounded-2xl border border-[#e6dfdd] bg-white p-4">
      <div className="mb-4 text-sm font-semibold text-[#667b68]">Navigation</div>
      <nav className="flex flex-col gap-2">
        {mode === "browse" ? (
          <NavItem href="/me" label="My Page" icon={User} />
        ) : (
          <NavItem href="/recipes" label="Browse Recipes" icon={User} />
        )}
        <NavItem href="/recipes/create" label="Create" icon={PlusCircle} />
        <NavItem href="/updates" label="Updates" icon={Bell} />
        <NavItem href="/settings" label="Settings" icon={Settings} />
      </nav>
    </aside>
  );
}
