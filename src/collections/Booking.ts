import { CollectionConfig } from 'payload'
import { AccessArgs } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  access: {
    read: ({ req: { user } }: AccessArgs) => {
      if (user?.role === 'admin') return true

      if (user?.role === 'organizer') {
        // Organizer: only see bookings for their tenant
        return {
          tenant: {
            equals: user?.tenant, // ✅ valid field
          },
        }
      }

      if (user?.role === 'attendee') {
        // Attendee: only see their own bookings
        return {
          user: {
            equals: user?.id, // ✅ valid field
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
