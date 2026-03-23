import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  onSnapshot,
  doc,
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface Booking {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
}

const SERVICES_COLLECTION = 'services';
const BOOKINGS_COLLECTION = 'bookings';

export const getServices = async (): Promise<Service[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, SERVICES_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, SERVICES_COLLECTION);
    return [];
  }
};

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
  try {
    return await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COLLECTION);
  }
};

export const getUserBookings = (userId: string, callback: (bookings: Booking[]) => void) => {
  const q = query(collection(db, BOOKINGS_COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    callback(bookings);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
  });
};

export const getAllBookings = (callback: (bookings: Booking[]) => void) => {
  const q = query(collection(db, BOOKINGS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    callback(bookings);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
  });
};

export const addService = async (service: Omit<Service, 'id'>) => {
  try {
    return await addDoc(collection(db, SERVICES_COLLECTION), service);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, SERVICES_COLLECTION);
  }
};

export const updateService = async (id: string, service: Partial<Service>) => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    return await setDoc(serviceRef, service, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SERVICES_COLLECTION}/${id}`);
  }
};

export const deleteService = async (id: string) => {
  try {
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    const { deleteDoc } = await import('firebase/firestore');
    return await deleteDoc(serviceRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${SERVICES_COLLECTION}/${id}`);
  }
};
export const seedServices = async () => {
  const services = await getServices();
  if (services.length === 0) {
    const initialServices = [
      { name: 'Swedish Massage', description: 'Gentle, relaxing massage for stress relief.', duration: 60, price: 80 },
      { name: 'Deep Tissue Massage', description: 'Intense pressure for chronic muscle tension.', duration: 90, price: 120 },
      { name: 'Hot Stone Therapy', description: 'Heated stones to melt away tension.', duration: 75, price: 100 },
      { name: 'Aromatherapy Massage', description: 'Essential oils for physical and emotional well-being.', duration: 60, price: 90 },
    ];
    for (const service of initialServices) {
      await addDoc(collection(db, SERVICES_COLLECTION), service);
    }
  }
};
