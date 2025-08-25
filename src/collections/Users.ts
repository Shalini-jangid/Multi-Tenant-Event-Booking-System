import { CollectionConfig, AccessArgs } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req: { user } }: AccessArgs) => {
      if (user?.role === 'admin') return true

      // Deny if tenant is missing
      if (!user?.tenant) return false

      const tenantId =
        typeof user.tenant === 'object'
          ? user.tenant.id?.toString() ?? user.tenant._id?.toString() ?? null
          : user.tenant?.toString() ?? null

      return {
        tenant: {
          equals: tenantId,
        },
      }
    },
    create: ({ req: { user } }: AccessArgs) => {
      return user?.role === 'admin' || user?.role === 'organizer'
    },
    update: ({ req: { user } }: AccessArgs) => {
      if (user?.role === 'admin') return true

      if (!user?.tenant) return false

      const tenantId =
        typeof user.tenant === 'object'
          ? user.tenant.id?.toString() ?? user.tenant._id?.toString() ?? null
          : user.tenant?.toString() ?? null

      return {
        tenant: {
          equals: tenantId,
        },
      }
    },
    delete: ({ req: { user } }: AccessArgs) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.tenant) {
          if (req.user.tenant) {
            data.tenant =
              typeof req.user.tenant === 'object'
                ? req.user.tenant.id?.toString() ?? req.user.tenant._id?.toString()
                : req.user.tenant.toString()
          } else {
            data.tenant = undefined
          }
        }

        // Prevent privilege escalation
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
        { label: 'Attendee', value: 'attendee' },
        { label: 'Organizer', value: 'organizer' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        condition: (_, __, { user }) => user?.role === 'admin',
      },
    },
  ],
}
