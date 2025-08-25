import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        tenant: {
          equals: user?.tenant,
        },
      }
    },
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'organizer'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      return {
        tenant: {
          equals: user?.tenant,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.tenant) {
          // ✅ Make sure we assign only the tenant ID
          data.tenant = typeof req.user.tenant === 'object'
            ? req.user.tenant.id || req.user.tenant._id
            : req.user.tenant
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'attendee',
      options: [
        {
          label: 'Attendee',
          value: 'attendee',
        },
        {
          label: 'Organizer',
          value: 'organizer',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        // ✅ Only show tenant field in admin panel if user is an Admin
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
  ],
}
