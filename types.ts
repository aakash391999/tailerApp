export enum ServiceType {
  PANT = 'Pant Stitching',
  SHIRT = 'Shirt Stitching',
  SUIT = 'Complete Suit',
  ALTERATION = 'Alteration',
  SAFARI = 'Safari Suit',
  KURTA = 'Kurta Pajama'
}

export interface Service {
  id: string;
  name: string;
  price: string;
  desc: string;
  img: string;
  category?: string;
}

export enum AppointmentType {
  VISIT = 'Visit Shop',
  PICKUP = 'Home Pickup'
}

export enum BookingStatus {
  PENDING = 'Pending',
  MEASUREMENT_TAKEN = 'Measurement Taken',
  CUTTING = 'Cutting',
  STITCHING = 'Stitching',
  TRIAL = 'Trial',
  READY = 'Ready',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Measurements {
  neck?: string;
  shoulder?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  sleeveLength?: string;
  shirtLength?: string;
  pantWaist?: string;
  pantLength?: string;
  inseam?: string;
  thigh?: string;
  [key: string]: string | undefined;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer' | 'tailor';
  phone?: string;
  emailVerified: boolean;
  measurements?: Measurements;
  createdAt?: number;
}

export interface Booking {
  id: string;
  userId?: string; // Optional for guest bookings, required for tracked bookings
  customerName: string;
  phone: string;
  address: string;
  serviceType: ServiceType;
  appointmentType: AppointmentType;
  date: string;
  notes: string;
  status: BookingStatus;
  createdAt: number;
  // Tailor Flow additions
  measurementsSnapshot?: Measurements;
  cost?: number;
  referenceImages?: string[];
  // Staff Assignment
  assignedTo?: string; // Tailor ID
  assignedName?: string; // Tailor Name
}