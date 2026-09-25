import { 
  Appointment, 
  ClientProfile, 
  Service, 
  ServiceCategory, 
  Chair, 
  Barber, 
  Order, 
  StudioNotification, 
  Product, 
  Accoutrement, 
  BeverageOption,
  Studio
} from '../types';
import { DetailedDemandAnalytics } from '../utils/bookingUtils';

export interface AtelierServerStore {
  studio?: Studio;
  appointments: Appointment[];
  pastAppointments: Appointment[];
  customers: ClientProfile[];
  services: Service[];
  categories: ServiceCategory[];
  chairs: Chair[];
  barbers: Barber[];
  products: Product[];
  orders: Order[];
  notifications: StudioNotification[];
  accoutrements: Accoutrement[];
  beverageOptions: BeverageOption[];
  demandInsights?: DetailedDemandAnalytics;
  lastUpdated?: string;
}

const API_BASE = '/api/atelier';

export async function fetchServerStore(): Promise<AtelierServerStore | null> {
  try {
    const res = await fetch(`${API_BASE}/state`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Could not fetch server store, falling back to local storage cache:', err);
    return null;
  }
}

export async function saveServerStore(store: Partial<AtelierServerStore>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save to server storage:', err);
    return false;
  }
}

export async function createServerAppointment(appointment: Appointment): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not create appointment on server storage:', err);
    return false;
  }
}

export async function updateServerAppointmentStatus(
  appointmentId: string, 
  status: Appointment['status']
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/appointment/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not update appointment on server storage:', err);
    return false;
  }
}

export async function createServerOrder(order: Order): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save order on server storage:', err);
    return false;
  }
}
