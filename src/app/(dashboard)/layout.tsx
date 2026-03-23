import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const userData = {
    email: user.email,
    full_name: user.user_metadata?.full_name,
  }

  return <AppShell user={userData}>{children}</AppShell>
}
