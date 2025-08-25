import { Endpoint } from 'payload'
import { getEventCapacityInfo, createNotification, createBookingLog } from '../utils/booking-helpers'

export const bookEventEndpoint: Endpoint = {
  path: '/book-event',
  method: 'post',
  handler: async (req, res) => {
    const { user, payload } = req
    const { eventId } = req.body

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' })
    }

    try {
      // Check if user already has a booking for this event
      const existingBooking = await payload.find({
        collection: 'bookings',
        where: {
          event: {
            equals: eventId,
          },
          user: {
            equals: user.id,
          },
          status: {
            not_equals: 'canceled',
          },
        },
      })

      if (existingBooking.totalDocs > 0) {
        return res.status(400).json({ error: 'You already have a booking for this event' })
      }

      // Get event and capacity info
      const event = await payload.findByID({
        collection: 'events',
        id: eventId,
      })

      if (event.tenant !== user.tenant) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const capacityInfo = await getEventCapacityInfo(payload, eventId)
      const status = capacityInfo.isFull ? 'waitlisted' : 'confirmed'

      // Create booking
      const booking = await payload.create({
        collection: 'bookings',
        data: {
          event: eventId,
          user: user.id,
          status,
          tenant: user.tenant,
        },
      })

      return res.status(201).json({
        message: `Booking ${status} successfully`,
        booking,
        status,
      })
    } catch (error) {
      console.error('Error booking event:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
}