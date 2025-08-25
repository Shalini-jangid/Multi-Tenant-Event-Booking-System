import { Endpoint, PayloadRequest } from 'payload'
import { promoteOldestWaitlisted, createNotification, createBookingLog } from '../utils/booking-helpers'

interface CancelBookingBody {
  bookingId: string
}

export const cancelBookingEndpoint: Endpoint = {
  path: '/cancel-booking',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const { user, payload } = req
    
    // Parse the request body
    let body: CancelBookingBody
    try {
      const bodyText = await new Response(req.body).text()
      body = JSON.parse(bodyText)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { bookingId } = body

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!user.tenant) {
      return new Response(
        JSON.stringify({ error: 'User tenant not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    try {
      // Get the booking
      const booking = await payload.findByID({
        collection: 'bookings',
        id: bookingId,
      })

      // Check ownership
      if (booking.user !== user.id && user.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      if (booking.status === 'cancelled') {
        return new Response(
          JSON.stringify({ error: 'Booking is already cancelled' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Update booking status to cancelled
      await payload.update({
        collection: 'bookings',
        id: bookingId,
        data: {
          status: 'cancelled',
        },
      })

      // If it was a confirmed booking, promote someone from waitlist
      if (booking.status === 'confirmed') {
        await promoteOldestWaitlisted(payload, booking.event as string, user.tenant as string)
      }

      return new Response(
        JSON.stringify({
          message: 'Booking cancelled successfully',
          booking: { ...booking, status: 'cancelled' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error cancelling booking:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}