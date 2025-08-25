import { Endpoint } from 'payload'

export const markNotificationReadEndpoint: Endpoint = {
  path: '/notifications/:id/read',
  method: 'post',
  handler: async (req, res) => {
    const { user, payload } = req
    const { id } = req.params

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' })
    }

    try {
      // Get the notification first to check ownership
      const notification = await payload.findByID({
        collection: 'notifications',
        id,
      })

      if (notification.user !== user.id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Mark as read
      const updatedNotification = await payload.update({
        collection: 'notifications',
        id,
        data: {
          read: true,
        },
      })

      return res.status(200).json({
        message: 'Notification marked as read',
        notification: updatedNotification,
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
}