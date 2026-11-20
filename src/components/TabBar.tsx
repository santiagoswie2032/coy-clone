"use client";

import { Home, Flame } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Flame },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-bg border-t-2 border-ink z-50 safe-area-bottom">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? "text-pink" : "text-muted hover:text-ink"
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-full px-4 py-1.5 transition-all ${
                  isActive
                    ? "bg-pink-tint shadow-hard-sm"
                    : ""
                }`}
                style={isActive ? { boxShadow: "2px 2px 0 var(--ink)" } : {}}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
