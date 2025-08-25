import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { authService } from '../lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = authService.getUser()
    
    if (!user || !authService.isAuthenticated()) {
      router.push('/login')
    } else if (user.role === 'organizer' || user.role === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/events')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}