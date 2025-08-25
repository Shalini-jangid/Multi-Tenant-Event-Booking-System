import { Endpoint } from 'payload'

export const dashboardEndpoint: Endpoint = {
  path: '/dashboard',
  method: 'get',
  handler: async (req, res) => {
    const { user, payload } = req

    if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      // Get upcoming events for the organizer's tenant
      const events = await payload.find({
        collection: 'events',
        where: {
          tenant: {
            equals: user.tenant,
          },
          date: {
            greater_than: new Date().toISOString(),
          },
        },
        sort: 'date',
      })

      // Get booking counts for each event
      const eventsWithCounts = await Promise.all(
        events.docs.map(async (event: any) => {
          const [confirmed, waitlisted, canceled] = await Promise.all([
            payload.find({
              collection: 'bookings',
              where: {
                event: { equals: event.id },
                status: { equals: 'confirmed' },
              },
            }),
            payload.find({
              collection: 'bookings',
              where: {
                event: { equals: event.id },
                status: { equals: 'waitlisted' },
              },
            }),
            payload.find({
              collection: 'bookings',
              where: {
                event: { equals: event.id },
                status: { equals: 'canceled' },
              },
            }),
          ])

          const confirmedCount = confirmed.totalDocs
          const waitlistedCount = waitlisted.totalDocs
          const canceledCount = canceled.totalDocs
          const percentageFilled = (confirmedCount / event.capacity) * 100

          return {
            ...event,
            confirmedCount,
            waitlistedCount,
            canceledCount,
            percentageFilled: Math.round(percentageFilled * 100) / 100,
          }
        })
      )

      // Get summary analytics
      const [totalConfirmed, totalWaitlisted, totalCanceled] = await Promise.all([
        payload.find({
          collection: 'bookings',
          where: {
            tenant: { equals: user.tenant },
            status: { equals: 'confirmed' },
          },
        }),
        payload.find({
          collection: 'bookings',
          where: {
            tenant: { equals: user.tenant },
            status: { equals: 'waitlisted' },
          },
        }),
        payload.find({
          collection: 'bookings',
          where: {
            tenant: { equals: user.tenant },
            status: { equals: 'canceled' },
          },
        }),
      ])

      // Get recent activity (last 5 booking logs)
      const recentActivity = await payload.find({
        collection: 'bookinglogs',
        where: {
          tenant: {
            equals: user.tenant,
          },
        },
        populate: {
          user: {
            name: true,
            email: true,
          },
          event: {
            title: true,
          },
          booking: true,
        },
        sort: '-createdAt',
        limit: 5,
      })

      const dashboardData = {
        upcomingEvents: eventsWithCounts,
        summary: {
          totalEvents: events.totalDocs,
          totalConfirmedBookings: totalConfirmed.totalDocs,
          totalWaitlistedBookings: totalWaitlisted.totalDocs,
          totalCanceledBookings: totalCanceled.totalDocs,
        },
        recentActivity: recentActivity.docs,
      }

      return res.status(200).json(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
}