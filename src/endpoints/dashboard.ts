import { Endpoint, PayloadRequest } from 'payload'

export const dashboardEndpoint: Endpoint = {
  path: '/dashboard',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { user, payload } = req

    if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
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
          const [confirmed, pending, cancelled] = await Promise.all([
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
                status: { equals: 'pending' },
              },
            }),
            payload.find({
              collection: 'bookings',
              where: {
                event: { equals: event.id },
                status: { equals: 'cancelled' },
              },
            }),
          ])

          const confirmedCount = confirmed.totalDocs
          const pendingCount = pending.totalDocs
          const cancelledCount = cancelled.totalDocs
          const percentageFilled = (confirmedCount / event.capacity) * 100

          return {
            ...event,
            confirmedCount,
            pendingCount,
            cancelledCount,
            percentageFilled: Math.round(percentageFilled * 100) / 100,
          }
        })
      )

      // Get summary analytics
      const [totalConfirmed, totalPending, totalCancelled] = await Promise.all([
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
            status: { equals: 'pending' },
          },
        }),
        payload.find({
          collection: 'bookings',
          where: {
            tenant: { equals: user.tenant },
            status: { equals: 'cancelled' },
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
          users: {
            name: true,
            email: true,
          },
          events: {
            title: true,
          },
          bookings: {
            status: true,
          },
        },
        sort: '-createdAt',
        limit: 5,
      })

      const dashboardData = {
        upcomingEvents: eventsWithCounts,
        summary: {
          totalEvents: events.totalDocs,
          totalConfirmedBookings: totalConfirmed.totalDocs,
          totalPendingBookings: totalPending.totalDocs,
          totalCancelledBookings: totalCancelled.totalDocs,
        },
        recentActivity: recentActivity.docs,
      }

      return new Response(
        JSON.stringify(dashboardData),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}