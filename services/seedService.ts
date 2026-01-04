import { db } from './firebase';
import { collection, addDoc, setDoc, doc, writeBatch } from 'firebase/firestore';
import { User, Booking, BookingStatus, Service, AppointmentType, ServiceType } from '../types';

const FIRST_NAMES = [
    "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Muhammad", "Rohan", "Krishna", "Ishaan",
    "Zara", "Diya", "Ananya", "Myra", "Aadhya", "Saanvi", "Pari", "Fatima", "Ayesha", "Zoya",
    "Rahul", "Amit", "Suresh", "Ramesh", "Priya", "Sneha", "Kavita", "Anita", "Vikram", "Sanjay",
    "Bilal", "Ahmed", "Mustafa", "Ibrahim", "Yusuf", "Hamza", "Omar", "Ali", "Hassan", "Hussain"
];

const LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Malik", "Khan", "Patel", "Singh", "Kumar", "Das", "Rao",
    "Reddy", "Nair", "Iyer", "Siddiqui", "Ansari", "Mirza", "Sheikh", "Pathan", "Chopra", "Mehta"
];

const SERVICE_TYPES = [
    "Pant Stitching", "Shirt Stitching", "Complete Suit", "Kurta Pajama", "Safari Suit", "Sherwani", "Waistcoat", "Blazer"
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Lucknow", "Jaipur"];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    console.log("Starting data seeding...");

    // 1. Create Users (40 Customers, 10 Tailors)
    const users: User[] = [];

    // Create 10 Tailors
    for (let i = 0; i < 10; i++) {
        const name = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
        const id = `tailor_${Date.now()}_${i}`;
        const user: User = {
            id,
            name,
            email: `tailor${i + 1}@majeed.com`,
            role: 'tailor',
            emailVerified: true,
            createdAt: Date.now() - getRandomInt(0, 1000000000),
            phone: `9${getRandomInt(100000000, 999999999)}`
        };
        users.push(user);
        batch.set(doc(db, "users", id), user);
    }

    // Create 40 Customers
    for (let i = 0; i < 40; i++) {
        const name = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
        const id = `user_${Date.now()}_${i}`;
        const user: User = {
            id,
            name,
            email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
            role: 'customer',
            emailVerified: Math.random() > 0.5,
            createdAt: Date.now() - getRandomInt(0, 1000000000),
            phone: `9${getRandomInt(100000000, 999999999)}`
        };
        users.push(user);
        batch.set(doc(db, "users", id), user);
    }

    // 2. Create Services (Ensure at least a base set)
    const serviceImages = [
        "https://images.unsplash.com/photo-1594938298603-c8148c47e356?auto=format&fit=crop&q=80&w=600", // Suit
        "https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&q=80&w=600", // Shirt
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600", // Pant
        "https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&q=80&w=600", // Kurta
        "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&q=80&w=600"  // Safari
    ];

    SERVICE_TYPES.forEach((svcName, idx) => {
        const id = `service_${idx}`;
        const service: Service = {
            id,
            name: svcName,
            price: `₹${getRandomInt(500, 5000)}+`,
            desc: `Premium quality ${svcName.toLowerCase()} with custom fitting and styling options.`,
            img: serviceImages[idx % serviceImages.length],
            category: 'Men'
        };
        batch.set(doc(db, "services", id), service);
    });

    // 3. Create Bookings (Mixed Statuses)
    // We'll create about 50 bookings distributed across users and tailors
    const tailors = users.filter(u => u.role === 'tailor');
    const customers = users.filter(u => u.role === 'customer');

    const statuses = Object.values(BookingStatus);

    for (let i = 0; i < 50; i++) {
        const customer = getRandomElement(customers);
        const status = getRandomElement(statuses);
        const assignedTailor = (status !== BookingStatus.PENDING && Math.random() > 0.2) ? getRandomElement(tailors) : null;

        const bookingId = `booking_${Date.now()}_${i}`;
        const serviceType = getRandomElement(Object.values(ServiceType));

        const booking: Booking = {
            id: bookingId,
            userId: customer.id,
            customerName: customer.name,
            serviceType: serviceType,
            date: new Date(Date.now() + getRandomInt(-864000000, 864000000)).toISOString().split('T')[0], // Random dates +/- 10 days
            status: status,
            appointmentType: Math.random() > 0.5 ? AppointmentType.VISIT : AppointmentType.PICKUP,
            address: `${getRandomInt(1, 100)}, Block ${getRandomElement(['A', 'B', 'C'])}, ${getRandomElement(CITIES)}`,
            phone: customer.phone || '9999999999',
            notes: "Demo booking notes", // Added missing field
            createdAt: Date.now() - getRandomInt(0, 500000000),
            ...(assignedTailor ? { assignedTo: assignedTailor.id, assignedName: assignedTailor.name } : {})
        };

        batch.set(doc(db, "bookings", bookingId), booking);
    }

    await batch.commit();
    console.log("Seeding complete!");
};
