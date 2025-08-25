import { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) =>
      user?.role === 'admin'
        ? true
        : {
            tenant: {
              equals: user?.tenant,
            },
          },
    create: ({ req: { user } }) =>
      user?.role === 'organizer' || user?.role === 'admin',
    update: ({ req: { user } }) =>
      user?.role === 'admin'
        ? true
        : {
            organizer: {
              equals: user?.id,
            },
          },
    delete: ({ req: { user } }) =>
      user?.role === 'admin'
        ? true
        : {
            organizer: {
              equals: user?.id,
            },
          },
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.tenant) data.tenant = req.user.tenant
        if (req.user && !data.organizer) data.organizer = req.user.id
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        rows: 6,
        placeholder: 'Enter event description...',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
      required: false,
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
    },
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: {
          in: ['organizer', 'admin'],
        },
      },
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