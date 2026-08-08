"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthGate } from "@/components/dashboard/auth-gate";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Building2,
  LogOut,
  Menu,
  Truck,
  User as UserIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/clients", label: "Clients", icon: Building2 },
  { href: "/dashboard/profile", label: "My Profile", icon: UserIcon },
  { href: "/dashboard/users", label: "Users", icon: Users, adminOnly: true },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems
        .filter((item) => !item.adminOnly || user?.role === "admin")
        .map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

function UserMenu() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    dispatch(logout());
    router.push("/login");
    window.location.reload();
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-secondary">
          <Avatar className="h-8 w-8">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.employeeId}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGate>
      <div className="min-h-screen bg-secondary/30">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-4 w-4" />
            </div>
            <span className="font-bold">AS-Teamet</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <div className="border-t p-3">
            <UserMenu />
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="font-bold">AS-Teamet</span>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <div className="mt-auto border-t p-3">
                <UserMenu />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-4 w-4" />
            </div>
            <span className="font-bold">AS-Teamet</span>
          </div>
          <UserMenu />
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          <main className="min-h-[calc(100vh-4rem)] p-4 lg:min-h-screen lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
