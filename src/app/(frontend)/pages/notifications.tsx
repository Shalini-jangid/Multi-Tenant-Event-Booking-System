import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { authService } from '../lib/auth'
import { apiService, Notification } from '../lib/api'
import { format } from 'date-fns'

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const user = authService.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    loadNotifications()
  }, [router])

  const loadNotifications = async () => {
    try {
      const notificationsData = await apiService.getMyNotifications()
      setNotifications(notificationsData)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId)
    
    try {
      await apiService.markNotificationRead(notificationId)
      // Remove from unread notifications list
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      setError('Failed to mark notification as read')
    } finally {
      setMarkingRead(null)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return '✅'
      case 'waitlisted':
        return '⏳'
      case 'waitlist_promoted':
        return '🎉'
      case 'booking_canceled':
        return '❌'
      default:
        return '📧'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return 'border-green-200 bg-green-50'
      case 'waitlisted':
        return 'border-yellow-200 bg-yellow-50'
      case 'waitlist_promoted':
        return 'border-blue-200 bg-blue-50'
      case 'booking_canceled':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-600">
                {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/events')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Browse Events
              </button>
              <button
                onClick={() => router.push('/bookings')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                My Bookings
              </button>
              <button
                onClick={async () => {
                  await authService.logout()
                  router.push('/login')
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-6 ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Event: {notification.booking?.event?.title}</p>
                      <p>Received: {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={markingRead === notification.id}
                  className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {markingRead === notification.id ? 'Marking...' : 'Mark as Read'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-500 text-lg mb-4">
              All caught up! No unread notifications.
            </p>
            <button
              onClick={() => router.push('/events')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Browse Events
            </button>
          </div>
        )}
      </main>
    </div>
  )
}