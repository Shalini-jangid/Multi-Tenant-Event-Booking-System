import { Endpoint, PayloadRequest } from 'payload'
import { getEventCapacityInfo } from '../utils/booking-helpers'

interface BookEventBody {
  eventId: string
}

export const bookEventEndpoint: Endpoint = {
  path: '/book-event',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const { user, payload } = req
    
    // Parse the request body
    let body: BookEventBody
    try {
      const bodyText = await new Response(req.body).text()
      body = JSON.parse(bodyText)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { eventId } = body

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

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'Event ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    try {
      const existingBooking = await payload.find({
        collection: 'bookings',
        where: {
          event: { equals: eventId },
          user: { equals: user.id },
          status: { not_equals: 'canceled' },
        },
      })

      if (existingBooking.totalDocs > 0) {
        return new Response(
          JSON.stringify({ error: 'You already have a booking for this event' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const event = await payload.findByID({
        collection: 'events',
        id: eventId,
      })

      if (!event || event.tenant !== user.tenant) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const capacityInfo = await getEventCapacityInfo(payload, eventId)
      const status = capacityInfo.isFull ? 'pending' : 'confirmed'

      const booking = await payload.create({
        collection: 'bookings',
        data: {
          event: eventId,
          user: user.id,
          status,
          tenant: user.tenant,
        },
      })

      return new Response(
        JSON.stringify({
          message: `Booking ${status} successfully`,
          booking,
          status,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error booking event:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}