import { Booking, BookingStatus } from '../types';
import { getCurrentUser } from './authService';

import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';

const BOOKINGS_COLLECTION = 'bookings';

export const getBookings = async (userId?: string): Promise<Booking[]> => {
  try {
    let q;
    if (userId) {
      // Customers see their own bookings
      q = query(collection(db, BOOKINGS_COLLECTION), where("userId", "==", userId), orderBy("createdAt", "desc"));
    } else {
      // Admin fetches all (this could be refined to 'if admin' check but for now we fetch all)
      // NOTE: Firestore requires an index for compound queries. 
      // For simple fetching we might just fetch all and filter client side if the dataset is small,
      // or rely on simple ordering.
      q = query(collection(db, BOOKINGS_COLLECTION), orderBy("createdAt", "desc"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...(doc.data() as any), id: doc.id } as Booking));
  } catch (error) {
    console.error("Error getting bookings: ", error);
    return [];
  }
};

export const saveBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId'>, userId?: string): Promise<Booking> => {
  const currentUser = getCurrentUser();
  const finalUserId = userId || (currentUser ? currentUser.id : undefined);

  const newBookingData = {
    ...booking,
    userId: finalUserId,
    createdAt: Date.now(),
    status: BookingStatus.PENDING,
    // Initialize Tailor Flow fields
    measurementsSnapshot: {},
    referenceImages: [],
    cost: 0
  };

  try {
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), newBookingData);
    return { ...newBookingData, id: docRef.id } as Booking;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<void> => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(bookingRef, { status });
  } catch (e) {
    console.error("Error updating status: ", e);
    throw e;
  }
};

export const updateBookingMeasurements = async (id: string, measurements: any): Promise<void> => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(bookingRef, { measurementsSnapshot: measurements });
  } catch (e) {
    console.error("Error updating measurements: ", e);
    throw e;
  }
};

export const assignBooking = async (id: string, tailorId: string, tailorName: string): Promise<void> => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(bookingRef, {
      assignedTo: tailorId,
      assignedName: tailorName
    });
  } catch (e) {
    console.error("Error assigning booking: ", e);
    throw e;
  }
};

export const generateWhatsAppLink = (booking: Booking): string => {
  const phone = "919876543210"; // Replace with shop owner's number
  const text = `
*New Booking Request - Majeed Elite Tailor*
------------------
👤 *Name:* ${booking.customerName}
📞 *Phone:* ${booking.phone}
✂️ *Service:* ${booking.serviceType}
📍 *Type:* ${booking.appointmentType}
📅 *Date:* ${booking.date}
🏠 *Address:* ${booking.address || 'Shop Visit'}
📝 *Notes:* ${booking.notes}
  `.trim();

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};