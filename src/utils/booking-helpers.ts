import payload from 'payload'
import type { Bookinglog, Notification } from '../payload-types' // adjust path if needed

// Use exact enum types from generated Payload types
export type NotificationType = Notification['type']
export type BookingActionType = Bookinglog['action']

export interface NotificationData {
  user: string
  booking: string
  type: NotificationType
  tenant: string
}

export interface BookingLogData {
  booking: string
  event: string
  user: string
  action: BookingActionType
  note: string
  tenant: string
}

// Create a notification
export async function createNotification(payloadInstance: typeof payload, data: NotificationData) {
  const { user, booking, type, tenant } = data

  const titles: Record<NotificationType, string> = {
    booking_confirmed: 'Booking Confirmed',
    waitlisted: 'Added to Waitlist',
    waitlist_promoted: 'Promoted from Waitlist',
    booking_canceled: 'Booking Canceled',
  }

  const messages: Record<NotificationType, string> = {
    booking_confirmed: 'Your booking has been confirmed!',
    waitlisted: 'The event is full. You have been added to the waitlist.',
    waitlist_promoted: 'Great news! You have been promoted from the waitlist and your booking is now confirmed.',
    booking_canceled: 'Your booking has been canceled.',
  }

  await payloadInstance.create({
    collection: 'notifications',
    data: {
      user,
      booking,
      type,
      title: titles[type],
      message: messages[type],
      read: false,
      tenant,
    },
  })
}

// Create a booking log
export async function createBookingLog(payloadInstance: typeof payload, data: BookingLogData) {
  await payloadInstance.create({
    collection: 'bookinglogs',
    data,
  })
}

// Get event capacity info
export async function getEventCapacityInfo(payloadInstance: typeof payload, eventId: string) {
  const bookings = await payloadInstance.find({
    collection: 'bookings',
    where: {
      event: {
        equals: eventId,
      },
      status: {
        equals: 'confirmed',
      },
    },
  })

  const event = await payloadInstance.findByID({
    collection: 'events',
    id: eventId,
  })

  const capacity = event?.capacity ?? 0

  return {
    confirmedCount: bookings.totalDocs,
    capacity,
    isFull: bookings.totalDocs >= capacity,
  }
}

// Promote oldest waitlisted booking
export async function promoteOldestWaitlisted(payloadInstance: typeof payload, eventId: string, tenantId: string) {
  const waitlistedBookings = await payloadInstance.find({
    collection: 'bookings',
    where: {
      event: {
        equals: eventId,
      },
      status: {
        equals: 'waitlisted',
      },
      tenant: {
        equals: tenantId,
      },
    },
    sort: 'createdAt',
    limit: 1,
  })

  if (waitlistedBookings.docs.length > 0) {
    const oldestWaitlisted = waitlistedBookings.docs[0]

    await payloadInstance.update({
      collection: 'bookings',
      id: oldestWaitlisted.id,
      data: {
        status: 'confirmed',
      },
    })

    await createNotification(payloadInstance, {
      user: oldestWaitlisted.user as string,
      booking: oldestWaitlisted.id,
      type: 'waitlist_promoted',
      tenant: tenantId,
    })

    await createBookingLog(payloadInstance, {
      booking: oldestWaitlisted.id,
      event: eventId,
      user: oldestWaitlisted.user as string,
      action: 'promote_from_waitlist',
      note: 'Promoted from waitlist due to cancellation',
      tenant: tenantId,
    })
  }
}
