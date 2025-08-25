import { Endpoint, PayloadRequest } from 'payload'

export const myNotificationsEndpoint: Endpoint = {
  path: '/my-notifications',
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
      const notifications = await payload.find({
        collection: 'notifications',
        where: {
          user: {
            equals: user.id,
          },
          read: {
            equals: false,
          },
        },
        populate: {
          bookings: {
            event: true,
          },
        },
        sort: '-createdAt',
      })

      return new Response(
        JSON.stringify({
          notifications: notifications.docs,
          totalDocs: notifications.totalDocs,
          page: notifications.page,
          totalPages: notifications.totalPages,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}