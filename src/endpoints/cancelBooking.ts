import { Endpoint } from 'payload'
import { promoteOldestWaitlisted, createNotification, createBookingLog } from '../utils/booking-helpers'

export const cancelBookingEndpoint: Endpoint = {
  path: '/cancel-booking',
  method: 'post',
  handler: async (req, res) => {
    const { user, payload } = req
    const { bookingId } = req.body

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' })
    }

    try {
      // Get the booking
      const booking = await payload.findByID({
        collection: 'bookings',
        id: bookingId,
      })

      // Check ownership
      if (booking.user !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' })
      }

      if (booking.status === 'canceled') {
        return res.status(400).json({ error: 'Booking is already canceled' })
      }

      // Update booking status to canceled
      await payload.update({
        collection: 'bookings',
        id: bookingId,
        data: {
          status: 'canceled',
        },
      })

      // If it was a confirmed booking, promote someone from waitlist
      if (booking.status === 'confirmed') {
        await promoteOldestWaitlisted(payload, booking.event as string, user.tenant as string)
      }

      return res.status(200).json({
        message: 'Booking canceled successfully',
        booking: { ...booking, status: 'canceled' },
      })
    } catch (error) {
      console.error('Error canceling booking:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
}