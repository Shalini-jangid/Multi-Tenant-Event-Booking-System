import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Events } from './collections/Events'
import { Bookings } from './collections/Booking'
import { Notifications } from './collections/Notifications'
import { BookingLogs } from './collections/BookingLogs'
import { Media } from './collections/Media'

import { bookEventEndpoint } from './endpoints/bookEvent'
import { cancelBookingEndpoint } from './endpoints/cancelBooking'
import { myBookingsEndpoint } from './endpoints/myBookings'
import { myNotificationsEndpoint } from './endpoints/myNotifications'
import { markNotificationReadEndpoint } from './endpoints/markNotificationRead'
import { dashboardEndpoint } from './endpoints/dashboard'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key',
  admin: {
    user: Users.slug,
  },
  collections: [
    Media,
    Tenants,
    Users,
    Events,
    Bookings,
    Notifications,
    BookingLogs,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  plugins: [],
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/event-booking',
  }),
  endpoints: [
    bookEventEndpoint,
    cancelBookingEndpoint,
    myBookingsEndpoint,
    myNotificationsEndpoint,
    markNotificationReadEndpoint,
    dashboardEndpoint,
  ],
  cors: [
    'http://localhost:3001',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],
  csrf: [
    'http://localhost:3001',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ],
})