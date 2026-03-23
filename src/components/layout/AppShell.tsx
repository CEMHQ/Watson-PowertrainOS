'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, Shield, AlertTriangle, Briefcase, LayoutDashboard,
  Truck, Settings, LogOut, ChevronRight, Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/workforce',   label: 'Workforce',    icon: Users },
  { href: '/compliance',  label: 'DOT Compliance', icon: Shield },
  { href: '/safety',      label: 'Safety',       icon: AlertTriangle },
  { href: '/hiring',      label: 'Hiring',       icon: Briefcase },
  { href: '/ai',          label: 'AI Assistant', icon: Brain },
]

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface AppShellProps {
  children: React.ReactNode
  user?: { email?: string; full_name?: string }
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Truck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-sidebar-foreground leading-none">PowertrainOS</span>
            <span className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">Watson Fleet</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3 w-3 opacity-50" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5">
          {bottomItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          {/* User */}
          <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-medium text-primary">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.full_name ?? user?.email ?? 'User'}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
