import { CollectionConfig } from 'payload'
import { createNotification, createBookingLog } from '../utils/booking-helpers'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'organizer') {
        return {
          tenant: {
            equals: user?.tenant,
          },
        }
      }
      
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'organizer') {
        return {
          tenant: {
            equals: user?.tenant,
          },
        }
      }
      
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.tenant) {
          data.tenant = req.user.tenant
        }
        if (req.user && !data.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        if (operation === 'create' || (previousDoc && doc.status !== previousDoc.status)) {
          // Create notification
          await createNotification(req.payload, {
            user: doc.user,
            booking: doc.id,
            type: getNotificationType(doc.status),
            tenant: doc.tenant,
          })
          
          // Create booking log
          await createBookingLog(req.payload, {
            booking: doc.id,
            event: doc.event,
            user: doc.user,
            action: getLogAction(doc.status, operation),
            note: `Booking ${doc.status}`,
            tenant: doc.tenant,
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      options: [
        {
          label: 'Confirmed',
          value: 'confirmed',
        },
        {
          label: 'Waitlisted',
          value: 'waitlisted',
        },
        {
          label: 'Canceled',
          value: 'canceled',
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
  ],
}

function getNotificationType(status: string) {
  switch (status) {
    case 'confirmed':
      return 'booking_confirmed'
    case 'waitlisted':
      return 'waitlisted'
    case 'canceled':
      return 'booking_canceled'
    default:
      return 'booking_confirmed'
  }
}

function getLogAction(status: string, operation: string) {
  if (operation === 'create') {
    return status === 'confirmed' ? 'auto_confirm' : 'auto_waitlist'
  }
  
  switch (status) {
    case 'confirmed':
      return 'promote_from_waitlist'
    case 'canceled':
      return 'cancel_confirmed'
    default:
      return 'create_request'
  }
}