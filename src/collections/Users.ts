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
          equals: typeof user?.tenant === 'object'
            ? user?.tenant.id?.toString()
            : user?.tenant?.toString(),
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
          equals: typeof user?.tenant === 'object'
            ? user?.tenant.id?.toString()
            : user?.tenant?.toString(),
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.tenant) {
          // ✅ Always store tenant as ID string only
          if (typeof req.user.tenant === 'object') {
            data.tenant = req.user.tenant.id?.toString() || req.user.tenant._id?.toString()
          } else {
            data.tenant = req.user.tenant?.toString()
          }
        }

        // 🔒 Prevent privilege escalation: only admins can assign admin role
        if (req.user?.role !== 'admin' && data.role === 'admin') {
          data.role = 'attendee'
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
