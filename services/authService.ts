import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from '../types';

// Helper to map Firebase User to our App User type
// Now optionally accepts a Firestore User Data object to merge
export const mapUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Default user structure
  let user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'Valued Customer',
    role: 'customer', // Default role
    emailVerified: firebaseUser.emailVerified
  };

  try {
    // Attempt to fetch additional details from Firestore
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      user = {
        ...user,
        name: data.name || user.name, // Firestore name takes precedence if meaningful
        role: data.role || user.role,
        phone: data.phone,
        measurements: data.measurements,
        createdAt: data.createdAt
      };
    } else {
      // Fallback or legacy admin check if not in DB yet
      if (firebaseUser.email === 'admin@majeed.com') {
        user.role = 'admin';
      }
    }
  } catch (error) {
    console.warn("Error fetching user profile from Firestore:", error);
    // Even if Firestore fails, return the basic auth user so key functionality works
    if (firebaseUser.email === 'admin@majeed.com') user.role = 'admin';
  }

  return user;
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await mapUser(userCredential.user);
  } catch (error: any) {
    console.error("Login Error details:", error);
    let message = "Failed to login";
    if (error.code === 'auth/invalid-credential') message = "Invalid email or password";
    else if (error.code === 'auth/user-not-found') message = "User not found";
    else if (error.code === 'auth/wrong-password') message = "Incorrect password";
    else if (error.message) message = `Error: ${error.message}`;

    throw new Error(message);
  }
};

export const register = async (name: string, email: string, password: string, role: 'admin' | 'customer' | 'tailor' = 'customer'): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user profile with the provided name in Auth
    await updateProfile(userCredential.user, {
      displayName: name
    });

    // Create User Document in Firestore
    const userDocRef = doc(db, "users", userCredential.user.uid);
    // const isAdmin = email === 'admin@majeed.com'; // Deprecated in favor of explicit role

    const userData: Partial<User> = {
      id: userCredential.user.uid,
      name: name,
      email: email,
      role: role, // Use selected role
      createdAt: Date.now(),
      emailVerified: false,
      measurements: {} // Initialize empty measurements
    };

    await setDoc(userDocRef, userData);

    // Send verification email
    await sendEmailVerification(userCredential.user);

    return await mapUser(userCredential.user);
  } catch (error: any) {
    console.error("Registration Error details:", error);
    let message = "Failed to register";
    if (error.code === 'auth/email-already-in-use') message = "Email already in use";
    else if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters";
    else if (error.message) message = `Error: ${error.message}`;

    throw new Error(message);
  }
};

export const resendVerificationEmail = async (): Promise<void> => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error("No user currently logged in.");
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentUser = (): User | null => {
  const user = auth.currentUser;
  if (!user) return null;
  // Note: Synchronous check might return incomplete profile (e.g. without measurements)
  // detailed fetching should happen in Context or logic that needs it.
  // For basic sync usage we return the Auth object mapped best-effort synchronously?
  // Actually, mapUser is async now. 
  // We can't return a Promise here if the signature expects strict User object immediately.
  // We will return a basic mapping and rely on AuthContext to do the full fetch.
  return {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || 'Valued Customer',
    role: user.email === 'admin@majeed.com' ? 'admin' : (user as any).role || 'customer', // Quick sync check
    emailVerified: user.emailVerified
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const updateUserRole = async (userId: string, newRole: 'admin' | 'customer' | 'tailor'): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};