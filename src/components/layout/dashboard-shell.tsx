"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, getMe } from "@/lib/api";
import type { AuthUser } from "@/lib/api";
import { useTheme } from "@/lib/theme-context";
import { Avatar } from "@/components/ui/avatar";
import {
  IconHome,
  IconBookOpen,
  IconCalendar,
  IconVideo,
  IconAward,
  IconUsers,
  IconUser,
  IconGrid,
  IconZap,
  IconLogOut,
  IconSun,
  IconMoon,
  IconSearch,
  IconUserPlus,
  IconUserCheck,
  IconPlus,
  IconSettings,
  IconFileCheck,
  IconHelpCircle,
} from "@/lib/icons";

interface NavItemDef {
  href: string;
  label: string;
  icon: (props: { size?: number; className?: string }) => React.ReactElement;
}

interface NavGroup {
  label?: string;
  items: NavItemDef[];
}

interface QuickAction {
  label: string;
  href: string;
  icon: (props: { size?: number; className?: string }) => React.ReactElement;
}

interface ShellConfig {
  role: string;
  brand: string;
  tagline: string;
  tone: "primary" | "secondary";
  navGroups: NavGroup[];
  searchPlaceholder: string;
  showSearch: boolean;
  headerAction?: { label: string; href: string };
  sidebarActions?: QuickAction[];
}

const SHELLS: Record<string, ShellConfig> = {
  student: {
    role: "student",
    brand: "LMS · Learn",
    tagline: "Your learning space",
    tone: "primary",
    navGroups: [
      {
        items: [
          { href: "/dashboard", label: "Dashboard", icon: IconHome },
          { href: "/dashboard/courses", label: "My Courses", icon: IconBookOpen },
          { href: "/dashboard/live", label: "Online Classes", icon: IconCalendar },
          { href: "/dashboard/certificates", label: "Certificates", icon: IconAward },
        ],
      },
    ],
    searchPlaceholder: "Search courses, lessons...",
    showSearch: true,
    headerAction: { label: "Continue Learning", href: "/dashboard/courses" },
  },
  teacher: {
    role: "teacher",
    brand: "LMS · Teach",
    tagline: "Instructor desk",
    tone: "secondary",
    navGroups: [
      {
        items: [
          { href: "/teacher", label: "Dashboard", icon: IconHome },
          { href: "/teacher/students", label: "Students", icon: IconUsers },
          { href: "/teacher/batches", label: "Batches", icon: IconGrid },
          { href: "/teacher/live", label: "Online Classes", icon: IconCalendar },
          { href: "/teacher/assignments", label: "Assignments", icon: IconFileCheck },
          { href: "/teacher/questions", label: "Questions", icon: IconHelpCircle },
        ],
      },
    ],
    searchPlaceholder: "Search students...",
    showSearch: false,
    headerAction: { label: "Schedule Class", href: "/teacher/live" },
  },
  admin: {
    role: "admin",
    brand: "LMS · Admin",
    tagline: "Management console",
    tone: "primary",
    navGroups: [
      {
        label: "People",
        items: [
          { href: "/admin", label: "Dashboard", icon: IconHome },
          { href: "/admin/registrations", label: "Registrations", icon: IconUserPlus },
          { href: "/admin/students", label: "Students", icon: IconUsers },
          { href: "/admin/teachers", label: "Teachers", icon: IconUser },
          { href: "/admin/assignments", label: "Assignments", icon: IconUserCheck },
        ],
      },
      {
        label: "Catalog",
        items: [
          { href: "/admin/courses", label: "Courses", icon: IconBookOpen },
          { href: "/admin/certificates", label: "Certificates", icon: IconAward },
        ],
      },
      {
        label: "Classes",
        items: [{ href: "/admin/batches", label: "Batches", icon: IconGrid }],
      },
    ],
    searchPlaceholder: "Search platform...",
    showSearch: false,
    sidebarActions: [
      { label: "Add Student", href: "/admin/students", icon: IconUserPlus },
      { label: "Add Teacher", href: "/admin/teachers", icon: IconUserPlus },
      { label: "Create Course", href: "/admin/courses", icon: IconPlus },
      { label: "Create Batch", href: "/admin/batches", icon: IconPlus },
    ],
  },
};

function useIsActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  const segments = href.replace(/^\/+/, "").split("/");
  if (segments.length > 1) return pathname.startsWith(href + "/");
  return false;
}

function Brand({ config, small = false }: { config: ShellConfig; small?: boolean }) {
  return (
    <Link href={`/${config.role}`} className="flex items-center">
      <img src="/qtest.png" alt="QTest Solutions" className={`${small ? "h-12 w-12" : "h-20 w-20"} rounded-[var(--radius-md)] object-cover`} />
    </Link>
  );
}

function Sidebar({ config }: { config: ShellConfig }) {
  const pathname = usePathname();
  const router = useRouter();
  const toneActive = config.tone === "secondary" ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary";

  const doLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-outline-variant/30 z-40 hidden lg:flex flex-col">
      <div className="p-6 border-b border-outline-variant/20">
        <Brand config={config} />
        <p className="font-label-caps text-on-surface-variant mt-1">{config.tagline}</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {config.navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && <p className="font-label-caps text-on-surface-variant/70 px-4 mb-1.5">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = useIsActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] text-body-sm font-semibold transition-all duration-200 ${
                      active
                        ? toneActive
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {config.sidebarActions && (
          <div className="pt-1">
            <p className="font-label-caps text-on-surface-variant/70 px-4 mb-1.5">Quick create</p>
            <div className="space-y-1">
              {config.sidebarActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 px-4 py-2 rounded-[var(--radius-md)] text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200"
                >
                  <a.icon size={18} />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-outline-variant/20 space-y-1">
        <Link
          href="/profile"
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-[var(--radius-md)] text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 ${
            useIsActive(pathname, "/profile") ? "bg-surface-container-high text-on-surface" : ""
          }`}
        >
          <IconSettings size={20} />
          Profile
        </Link>
        <button
          onClick={doLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-[var(--radius-md)] text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-200 cursor-pointer"
        >
          <IconLogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function Header({ config }: { config: ShellConfig }) {
  const { theme, toggle } = useTheme();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMe(getMe());
  }, []);

  const displayName = me?.name || "User";

  return (
    <header className="sticky top-0 z-30 bg-surface-bright/70 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        <div className="lg:hidden">
          <Brand config={config} small />
        </div>

        {config.showSearch && (
          <div className="flex-1 max-w-md mx-4 lg:mx-0 lg:ml-0 hidden sm:block">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                type="text"
                placeholder={config.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface rounded-[var(--radius-full)] border border-outline-variant/50 outline-none text-body-sm placeholder:text-on-surface-variant/40 focus:border-primary/30 focus:bg-surface-container transition-all duration-200"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {config.headerAction && (
            <Link href={config.headerAction.href} className="hidden md:block">
              <button
                className={`px-4 py-2 rounded-[var(--radius-lg)] text-body-sm font-semibold transition-all duration-200 ${
                  config.tone === "secondary"
                    ? "bg-secondary text-on-secondary hover:opacity-90"
                    : "bg-primary text-on-primary hover:opacity-90"
                }`}
              >
                {config.headerAction.label}
              </button>
            </Link>
          )}
          <button
            onClick={toggle}
            className="p-2 rounded-[var(--radius-md)] text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>
          <Avatar name={displayName} size="md" />
          <div className="hidden md:block">
            <p className="text-body-sm font-semibold text-on-surface">{displayName}</p>
            <p className="font-label-caps text-on-surface-variant capitalize">{me?.role ?? "student"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ config }: { config: ShellConfig }) {
  const pathname = usePathname();
  const items = config.navGroups.flatMap((g) => g.items).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flowmark-card-glass rounded-t-[var(--radius-xl)]">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const active = useIsActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-md)] transition-all duration-200 ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <item.icon size={20} />
              <span className="font-label-caps text-[10px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Shell({ config, children }: { config: ShellConfig; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar config={config} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header config={config} />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileNav config={config} />
    </div>
  );
}

export function StudentShell({ children }: { children: React.ReactNode }) {
  return <Shell config={SHELLS.student}>{children}</Shell>;
}

export function TeacherShell({ children }: { children: React.ReactNode }) {
  return <Shell config={SHELLS.teacher}>{children}</Shell>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <Shell config={SHELLS.admin}>{children}</Shell>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const me = getMe();
  const role = me?.role ?? "student";
  return <Shell config={SHELLS[role] ?? SHELLS.student}>{children}</Shell>;
}