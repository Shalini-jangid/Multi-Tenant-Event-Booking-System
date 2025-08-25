import { Endpoint } from 'payload'

export const myNotificationsEndpoint: Endpoint = {
  path: '/my-notifications',
  method: 'get',
  handler: async (req, res) => {
    const { user, payload } = req

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
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
          booking: {
            event: {
              title: true,
            },
          },
        },
        sort: '-createdAt',
      })

      return res.status(200).json({
        notifications: notifications.docs,
        totalDocs: notifications.totalDocs,
        page: notifications.page,
        totalPages: notifications.totalPages,
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
}