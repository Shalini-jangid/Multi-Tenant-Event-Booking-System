import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { authService } from '../lib/auth'
import { apiService, Booking } from '../lib/api'
import { format } from 'date-fns'

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const user = authService.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    loadBookings()
  }, [router])

  const loadBookings = async () => {
    try {
      const bookingsData = await apiService.getMyBookings()
      setBookings(bookingsData)
    } catch (err) {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    setCancelLoading(bookingId)
    setError('')
    setSuccess('')

    try {
      const response = await apiService.cancelBooking(bookingId)
      setSuccess(response.message)
      loadBookings() // Reload bookings
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel booking')
    } finally {
      setCancelLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓'
      case 'waitlisted':
        return '⏳'
      case 'canceled':
        return '✗'
      default:
        return '?'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading bookings...</div>
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
                My Bookings
              </h1>
              <p className="text-gray-600">Manage your event bookings</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/events')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Browse Events
              </button>
              <button
                onClick={() => router.push('/notifications')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Notifications
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

        {/* Bookings List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => {
              const event = typeof booking.event === 'object' ? booking.event : null
              return (
                <li key={booking.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {event?.title || 'Event Title'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event?.date && format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">
                          Capacity: {event?.capacity || 'N/A'}
                        </p>
                        
                        {booking.status !== 'canceled' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelLoading === booking.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            {cancelLoading === booking.id ? 'Canceling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Booked on {format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>

                    {/* Event Description */}
                    {event?.description && event.description[0]?.children?.[0]?.text && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          {event.description[0].children[0].text}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You haven't made any bookings yet.</p>
            <button
              onClick={() => router.push('/events')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Browse Events
            </button>
          </div>
        )}
      </main>
    </div>
  )
}