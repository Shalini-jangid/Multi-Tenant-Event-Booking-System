import { Endpoint, PayloadRequest } from 'payload'

export const myBookingsEndpoint: Endpoint = {
  path: '/my-bookings',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { user, payload } = req

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

    try {
      const bookings = await payload.find({
        collection: 'bookings',
        where: {
          user: {
            equals: user.id,
          },
        },
        populate: {
          events: {
            title: true,
            date: true,
            capacity: true,
          },
        },
        sort: '-createdAt',
      })

      return new Response(
        JSON.stringify({
          bookings: bookings.docs,
          totalDocs: bookings.totalDocs,
          page: bookings.page,
          totalPages: bookings.totalPages,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}