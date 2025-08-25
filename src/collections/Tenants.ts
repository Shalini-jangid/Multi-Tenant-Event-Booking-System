import { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true

      // safely extract tenantId
      const tenantId =
        typeof user?.tenant === 'object'
          ? user?.tenant?.id?.toString() || user?.tenant?._id?.toString()
          : user?.tenant?.toString()

      return {
        id: {
          equals: tenantId || '',
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}