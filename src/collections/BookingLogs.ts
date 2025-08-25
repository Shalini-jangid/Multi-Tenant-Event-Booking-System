import { CollectionConfig } from 'payload'

export const BookingLogs: CollectionConfig = {
  slug: 'bookinglogs',
  admin: {
    useAsTitle: 'action',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'organizer') return true
      
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.tenant) {
          data.tenant = req.user.tenant
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
    },
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
      name: 'action',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Create Request',
          value: 'create_request',
        },
        {
          label: 'Auto Waitlist',
          value: 'auto_waitlist',
        },
        {
          label: 'Auto Confirm',
          value: 'auto_confirm',
        },
        {
          label: 'Promote from Waitlist',
          value: 'promote_from_waitlist',
        },
        {
          label: 'Cancel Confirmed',
          value: 'cancel_confirmed',
        },
      ],
    },
    {
      name: 'note',
      type: 'text',
      required: true,
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