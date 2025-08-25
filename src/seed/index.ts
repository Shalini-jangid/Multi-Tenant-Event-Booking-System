import payload from 'payload'
import dotenv from 'dotenv'

dotenv.config()

async function seed() {
  try {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      local: true,
    })

    console.log('🌱 Starting seed process...')

    // Create tenants
    const tenant1 = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Tech Events Co',
      },
    })

    const tenant2 = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Creative Workshops Ltd',
      },
    })

    console.log('✅ Created tenants')

    // Create users for tenant 1
    const organizer1 = await payload.create({
      collection: 'users',
      data: {
        name: 'John Organizer',
        email: 'john@techevents.com',
        password: 'password123',
        role: 'organizer',
        tenant: tenant1.id,
      },
    })

    const attendee1_1 = await payload.create({
      collection: 'users',
      data: {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'password123',
        role: 'attendee',
        tenant: tenant1.id,
      },
    })

    const attendee1_2 = await payload.create({
      collection: 'users',
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'attendee',
        tenant: tenant1.id,
      },
    })

    const attendee1_3 = await payload.create({
      collection: 'users',
      data: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: 'password123',
        role: 'attendee',
        tenant: tenant1.id,
      },
    })

    // Create users for tenant 2
    const organizer2 = await payload.create({
      collection: 'users',
      data: {
        name: 'Sarah Organizer',
        email: 'sarah@creativeworkshops.com',
        password: 'password123',
        role: 'organizer',
        tenant: tenant2.id,
      },
    })

    const attendee2_1 = await payload.create({
      collection: 'users',
      data: {
        name: 'David Wilson',
        email: 'david@example.com',
        password: 'password123',
        role: 'attendee',
        tenant: tenant2.id,
      },
    })

    const attendee2_2 = await payload.create({
      collection: 'users',
      data: {
        name: 'Emma Brown',
        email: 'emma@example.com',
        password: 'password123',
        role: 'attendee',
        tenant: tenant2.id,
      },
    })

    const attendee2_3 = await payload.create({
      collection: 'users',
      data: {
        name: 'Frank Miller',
        email: 'frank@example.com',
        password: 'password123',
        role: 'attendee',
        tenant: tenant2.id,
      },
    })

    console.log('✅ Created users')

    // Create events for tenant 1
    const event1_1 = await payload.create({
      collection: 'events',
      data: {
        title: 'React Advanced Workshop',
        description: [
          {
            children: [
              {
                text: 'Learn advanced React patterns and best practices in this hands-on workshop.',
              },
            ],
          },
        ],
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        capacity: 2, // Small capacity to test waitlist
        organizer: organizer1.id,
        tenant: tenant1.id,
      },
    })

    const event1_2 = await payload.create({
      collection: 'events',
      data: {
        title: 'Node.js Best Practices',
        description: [
          {
            children: [
              {
                text: 'Deep dive into Node.js performance optimization and security.',
              },
            ],
          },
        ],
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
        capacity: 5,
        organizer: organizer1.id,
        tenant: tenant1.id,
      },
    })

    // Create events for tenant 2
    const event2_1 = await payload.create({
      collection: 'events',
      data: {
        title: 'Design Thinking Workshop',
        description: [
          {
            children: [
              {
                text: 'Learn the fundamentals of design thinking methodology.',
              },
            ],
          },
        ],
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        capacity: 3,
        organizer: organizer2.id,
        tenant: tenant2.id,
      },
    })

    const event2_2 = await payload.create({
      collection: 'events',
      data: {
        title: 'Creative Writing Masterclass',
        description: [
          {
            children: [
              {
                text: 'Enhance your creative writing skills with professional techniques.',
              },
            ],
          },
        ],
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
        capacity: 4,
        organizer: organizer2.id,
        tenant: tenant2.id,
      },
    })

    console.log('✅ Created events')

    // Create some sample bookings to demonstrate the system
    await payload.create({
      collection: 'bookings',
      data: {
        event: event1_1.id,
        user: attendee1_1.id,
        status: 'confirmed',
        tenant: tenant1.id,
      },
    })

    await payload.create({
      collection: 'bookings',
      data: {
        event: event1_1.id,
        user: attendee1_2.id,
        status: 'confirmed',
        tenant: tenant1.id,
      },
    })

    // This booking should be waitlisted since capacity is 2
    await payload.create({
      collection: 'bookings',
      data: {
        event: event1_1.id,
        user: attendee1_3.id,
        status: 'waitlisted',
        tenant: tenant1.id,
      },
    })

    await payload.create({
      collection: 'bookings',
      data: {
        event: event2_1.id,
        user: attendee2_1.id,
        status: 'confirmed',
        tenant: tenant2.id,
      },
    })

    console.log('✅ Created sample bookings')

    console.log('🎉 Seed completed successfully!')
    console.log('\n📋 Demo Credentials:')
    console.log('\nTenant 1 (Tech Events Co):')
    console.log('Organizer: john@techevents.com / password123')
    console.log('Attendees: alice@example.com, bob@example.com, carol@example.com / password123')
    console.log('\nTenant 2 (Creative Workshops Ltd):')
    console.log('Organizer: sarah@creativeworkshops.com / password123')
    console.log('Attendees: david@example.com, emma@example.com, frank@example.com / password123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()