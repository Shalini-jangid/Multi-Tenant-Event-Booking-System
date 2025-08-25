import { Endpoint } from 'payload'

export const myBookingsEndpoint: Endpoint = {
  path: '/my-bookings',
  method: 'get',
  handler: async (req, res) => {
    const { user, payload } = req

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
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
          event: {
            title: true,
            date: true,
            capacity: true,
          },
        },
        sort: '-createdAt',
      })

      return res.status(200).json({
        bookings: bookings.docs,
        totalDocs: bookings.totalDocs,
        page: bookings.page,
        totalPages: bookings.totalPages,
      })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
}