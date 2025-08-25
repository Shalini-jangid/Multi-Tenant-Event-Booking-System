import { CollectionConfig, AccessArgs, Where } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  access: {
    read: ({ req: { user } }: AccessArgs): Where | boolean => {
      if (user?.role === 'admin') return true

      if (user?.role === 'organizer') {
        // Organizer: only see bookings for their tenant
        return {
          tenant: {
            equals: user?.tenant,
          },
        }
      }

      if (user?.role === 'attendee') {
        // Attendee: only see their own bookings
        return {
          user: {
            equals: user?.id,
          },
        }
      }

      return false
    },
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'confirmed', 'cancelled'],
      defaultValue: 'pending',
    },
  ],
}