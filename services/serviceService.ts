import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Service } from '../types';

const SERVICES_COLLECTION = 'services';

export const getServices = async (): Promise<Service[]> => {
    try {
        const q = query(collection(db, SERVICES_COLLECTION));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
};

export const addService = async (service: Omit<Service, 'id'>): Promise<Service> => {
    try {
        const docRef = await addDoc(collection(db, SERVICES_COLLECTION), service);
        return { id: docRef.id, ...service };
    } catch (error) {
        console.error("Error adding service:", error);
        throw error;
    }
};

export const updateService = async (id: string, service: Partial<Service>): Promise<void> => {
    try {
        const serviceRef = doc(db, SERVICES_COLLECTION, id);
        await updateDoc(serviceRef, service);
    } catch (error) {
        console.error("Error updating service:", error);
        throw error;
    }
};

export const deleteService = async (id: string): Promise<void> => {
    try {
        const serviceRef = doc(db, SERVICES_COLLECTION, id);
        await deleteDoc(serviceRef);
    } catch (error) {
        console.error("Error deleting service:", error);
        throw error;
    }
};
