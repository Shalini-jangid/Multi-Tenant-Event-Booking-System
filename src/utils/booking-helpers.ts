import { Payload } from 'payload'

export interface NotificationData {
  user: string
  booking: string
  type: string
  tenant: string
}

export interface BookingLogData {
  booking: string
  event: string
  user: string
  action: string
  note: string
  tenant: string
}

export async function createNotification(payload: Payload, data: NotificationData) {
  const { user, booking, type, tenant } = data
  
  const titles = {
    booking_confirmed: 'Booking Confirmed',
    waitlisted: 'Added to Waitlist',
    waitlist_promoted: 'Promoted from Waitlist',
    booking_canceled: 'Booking Canceled',
  }
  
  const messages = {
    booking_confirmed: 'Your booking has been confirmed!',
    waitlisted: 'The event is full. You have been added to the waitlist.',
    waitlist_promoted: 'Great news! You have been promoted from the waitlist and your booking is now confirmed.',
    booking_canceled: 'Your booking has been canceled.',
  }
  
  await payload.create({
    collection: 'notifications',
    data: {
      user,
      booking,
      type,
      title: titles[type as keyof typeof titles] || 'Notification',
      message: messages[type as keyof typeof messages] || 'You have a new notification.',
      read: false,
      tenant,
    },
  })
}

export async function createBookingLog(payload: Payload, data: BookingLogData) {
  await payload.create({
    collection: 'bookinglogs',
    data,
  })
}

export async function getEventCapacityInfo(payload: Payload, eventId: string) {
  const bookings = await payload.find({
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
  
  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
  })
  
  return {
    confirmedCount: bookings.totalDocs,
    capacity: event.capacity,
    isFull: bookings.totalDocs >= event.capacity,
  }
}

export async function promoteOldestWaitlisted(payload: Payload, eventId: string, tenantId: string) {
  const waitlistedBookings = await payload.find({
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
    
    await payload.update({
      collection: 'bookings',
      id: oldestWaitlisted.id,
      data: {
        status: 'confirmed',
      },
    })
    
    // Create notification for promotion
    await createNotification(payload, {
      user: oldestWaitlisted.user as string,
      booking: oldestWaitlisted.id,
      type: 'waitlist_promoted',
      tenant: tenantId,
    })
    
    // Create log for promotion
    await createBookingLog(payload, {
      booking: oldestWaitlisted.id,
      event: eventId,
      user: oldestWaitlisted.user as string,
      action: 'promote_from_waitlist',
      note: 'Promoted from waitlist due to cancellation',
      tenant: tenantId,
    })
  }
}