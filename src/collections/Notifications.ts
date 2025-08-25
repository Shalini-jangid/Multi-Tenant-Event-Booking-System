import { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      
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
        return data
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Booking Confirmed',
          value: 'booking_confirmed',
        },
        {
          label: 'Waitlisted',
          value: 'waitlisted',
        },
        {
          label: 'Promoted from Waitlist',
          value: 'waitlist_promoted',
        },
        {
          label: 'Booking Canceled',
          value: 'booking_canceled',
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
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