import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { authService } from '../lib/auth'
import { apiService, Event } from '../lib/api'
import { format } from 'date-fns'
import { richTextToHtml } from '@payloadcms/richtext-to-html'

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const user = authService.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    loadEvents()
  }, [router])

  const loadEvents = async () => {
    try {
      const eventsData = await apiService.getEvents()
      setEvents(eventsData)
    } catch (err) {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleBookEvent = async (eventId: string) => {
    setBookingLoading(eventId)
    setError('')
    setSuccess('')

    try {
      const response = await apiService.bookEvent(eventId)
      setSuccess(response.message)
      // Optionally reload events to update capacity
      loadEvents()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book event')
    } finally {
      setBookingLoading(null)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    router.push('/login')
  }

  const navigateToBookings = () => {
    router.push('/bookings')
  }

  const navigateToNotifications = () => {
    router.push('/notifications')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading events...</div>
      </div>
    )
  }

  const user = authService.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Available Events
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={navigateToBookings}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                My Bookings
              </button>
              <button
                onClick={navigateToNotifications}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Notifications
              </button>
              {authService.isOrganizer() && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p className="flex items-center mb-1">
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">
                      {format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium">Capacity:</span>
                    <span className="ml-2">{event.capacity} attendees</span>
                  </p>
                </div>

                {/* Event Description */}
                <div className="mb-4 text-gray-700">
  {event.description && (
    <div
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: richTextToHtml(event.description) }}
    />
  )}
</div>

                <button
                  onClick={() => handleBookEvent(event.id)}
                  disabled={bookingLoading === event.id}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {bookingLoading === event.id ? 'Booking...' : 'Book Event'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  )
}