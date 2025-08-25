import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface Event {
  id: string
  title: string
  description: any[]
  date: string
  capacity: number
  organizer: string
  tenant: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  event: Event | string
  user: string
  status: 'confirmed' | 'waitlisted' | 'canceled'
  tenant: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  user: string
  booking: {
    id: string
    event: {
      title: string
    }
  }
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface DashboardData {
  upcomingEvents: Array<Event & {
    confirmedCount: number
    waitlistedCount: number
    canceledCount: number
    percentageFilled: number
  }>
  summary: {
    totalEvents: number
    totalConfirmedBookings: number
    totalWaitlistedBookings: number
    totalCanceledBookings: number
  }
  recentActivity: any[]
}

class ApiService {
  // Events
  async getEvents(): Promise<Event[]> {
    const response = await axios.get(`${API_BASE}/api/events`)
    return response.data.docs
  }

  async getEvent(id: string): Promise<Event> {
    const response = await axios.get(`${API_BASE}/api/events/${id}`)
    return response.data
  }

  // Bookings
  async bookEvent(eventId: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/api/book-event`, {
      eventId,
    })
    return response.data
  }

  async cancelBooking(bookingId: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/api/cancel-booking`, {
      bookingId,
    })
    return response.data
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await axios.get(`${API_BASE}/api/my-bookings`)
    return response.data.bookings
  }

  // Notifications
  async getMyNotifications(): Promise<Notification[]> {
    const response = await axios.get(`${API_BASE}/api/my-notifications`)
    return response.data.notifications
  }

  async markNotificationRead(notificationId: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/api/notifications/${notificationId}/read`)
    return response.data
  }

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const response = await axios.get(`${API_BASE}/api/dashboard`)
    return response.data
  }
}

export const apiService = new ApiService()