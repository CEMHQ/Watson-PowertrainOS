'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  const handleCareerCenterClick = () => router.push('/careers')
  const handleContactClick = () => router.push('/contact')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 max-w-4xl w-full">

        {/* Career Hub */}
        <div
          className="rounded-lg border border-border bg-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          id="careerCenter"
          onClick={handleCareerCenterClick}
        >
          <h3 className="text-xl font-semibold mb-2">Career Hub</h3>
          <p className="text-muted-foreground">Looking for a new opportunity? Click to apply for a position.</p>
        </div>

        {/* Contact Us */}
        <div
          className="rounded-lg border border-border bg-card p-6 cursor-pointer hover:shadow-md transition-shadow"
          id="contactUs"
          onClick={handleContactClick}
        >
          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <p className="text-muted-foreground">Want to reach out? Click to contact us.</p>
        </div>

        {/* User Sign-In */}
        <div
          className="rounded-lg border border-border bg-card p-6"
          id="signIn"
        >
          <Link href="/auth/login">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <h3 className="text-xl font-semibold mb-2">Sign In</h3>
            </div>
          </Link>
          <div className="mt-2">
            <h4 className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/login" className="text-primary underline">
                Sign up
              </Link>
            </h4>
          </div>
        </div>

      </main>
    </div>
  )
}
