import { Endpoint, PayloadRequest } from 'payload'

interface MarkNotificationReadBody {
  id: string
}

export const markNotificationReadEndpoint: Endpoint = {
  path: '/notifications/read',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const { user, payload } = req
    
    // Parse the request body to get the notification ID
    let body: MarkNotificationReadBody
    try {
      const bodyText = await new Response(req.body).text()
      body = JSON.parse(bodyText)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { id } = body

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

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Notification ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    try {
      // Get the notification first to check ownership
      const notification = await payload.findByID({
        collection: 'notifications',
        id,
      })

      if (notification.user !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Mark as read
      const updatedNotification = await payload.update({
        collection: 'notifications',
        id,
        data: {
          read: true,
        },
      })

      return new Response(
        JSON.stringify({
          message: 'Notification marked as read',
          notification: updatedNotification,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
}