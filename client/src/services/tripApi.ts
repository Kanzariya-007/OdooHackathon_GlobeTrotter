import axios from 'axios';
import { Trip, TripFormData, User, Destination, Activity, Budget } from '../types/trip';

// Load base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Authorization token if available in local storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('globetrotter_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// MOCK DATABASE & SEED DATA FOR ROBUST FALLBACK
// ==========================================

const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'dest-1',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 4,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'City of light, fashion, and world-class culinary art.'
  },
  {
    id: 'dest-2',
    city: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
    description: 'A neon-lit metropolis blending futuristic skyscrapers with historic temples.'
  },
  {
    id: 'dest-3',
    city: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 3,
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'A historic treasury of ancient ruins, Renaissance art, and gelato.'
  },
  {
    id: 'dest-4',
    city: 'Goa',
    country: 'India',
    region: 'Asia',
    costIndex: 2,
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    description: 'Tropical beaches, scenic spice plantations, and vibrant colonial heritage.'
  },
  {
    id: 'dest-5',
    city: 'New York',
    country: 'United States',
    region: 'North America',
    costIndex: 5,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    description: 'The City That Never Sleeps, famed for Broadway, Central Park, and skyline vistas.'
  }
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    name: 'European Dream Getaway',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    description: 'Exploring the architectural wonders and historical streets of Paris and Rome.',
    coverImage: 'https://images.unsplash.com/photo-1499856138863-71a179bf7f86?auto=format&fit=crop&w=800&q=80',
    destinations: [
      {
        id: 'dest-1',
        city: 'Paris',
        country: 'France',
        region: 'Europe',
        costIndex: 4,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'dest-3',
        city: 'Rome',
        country: 'Italy',
        region: 'Europe',
        costIndex: 3,
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
      }
    ],
    activities: [
      {
        id: 'act-1',
        name: 'Eiffel Tower Guided Summit Tour',
        category: 'Activities',
        duration: '3 hours',
        cost: 8000,
        description: 'Guided skip-the-line elevator entry to the summit deck.',
        startTime: '10:00',
        endTime: '13:00',
        date: '2026-09-11'
      },
      {
        id: 'act-2',
        name: 'Louvre Museum Masterpieces Tour',
        category: 'Activities',
        duration: '2.5 hours',
        cost: 6500,
        description: 'See the Mona Lisa, Venus de Milo and other priceless works.',
        startTime: '14:30',
        endTime: '17:00',
        date: '2026-09-12'
      },
      {
        id: 'act-3',
        name: 'TGV High-Speed Train (Paris to Rome)',
        category: 'Transport',
        duration: '7 hours',
        cost: 12000,
        description: 'Scenic train ride through French and Italian landscapes.',
        startTime: '08:00',
        endTime: '15:00',
        date: '2026-09-14'
      },
      {
        id: 'act-4',
        name: 'Colosseum & Roman Forum Walk',
        category: 'Activities',
        duration: '3 hours',
        cost: 5000,
        description: 'Walk the arena floor and hear stories of gladiators.',
        startTime: '09:00',
        endTime: '12:00',
        date: '2026-09-16'
      },
      {
        id: 'act-5',
        name: 'Vatican Museums & Sistine Chapel Tour',
        category: 'Activities',
        duration: '4 hours',
        cost: 7500,
        description: 'Marvel at Michelangelo frescoes and Renaissance art galleries.',
        startTime: '13:30',
        endTime: '17:30',
        date: '2026-09-17'
      },
      {
        id: 'act-6',
        name: 'Boutique Hotel Relais Rome',
        category: 'Accommodation',
        duration: '4 nights',
        cost: 45000,
        description: 'Comfortable stay in the historic center of Rome.',
        date: '2026-09-14'
      }
    ],
    budget: {
      totalBudget: 120000,
      transport: 25000,
      accommodation: 55000,
      activities: 27000,
      food: 10000,
      other: 3000
    },
    userId: 'user-mock-1'
  },
  {
    id: 'trip-2',
    name: 'Japan Autumn Adventure',
    startDate: '2026-11-05',
    endDate: '2026-11-15',
    description: 'Exploring the modern streets of Tokyo and the historic temples of Kyoto.',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    destinations: [
      {
        id: 'dest-2',
        city: 'Tokyo',
        country: 'Japan',
        region: 'Asia',
        costIndex: 4,
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80'
      }
    ],
    activities: [
      {
        id: 'act-7',
        name: 'Shibuya Crossing & Hachiko Statue',
        category: 'Activities',
        duration: '1 hour',
        cost: 0,
        description: 'Experience the world busiest pedestrian crossing.',
        startTime: '18:00',
        endTime: '19:00',
        date: '2026-11-06'
      },
      {
        id: 'act-8',
        name: 'Sushi Dai Tsukiji Breakfast',
        category: 'Food',
        duration: '1.5 hours',
        cost: 4500,
        description: 'Fresh world-class sushi breakfast at Outer Market.',
        startTime: '07:30',
        endTime: '09:00',
        date: '2026-11-07'
      }
    ],
    budget: {
      totalBudget: 180000,
      transport: 40000,
      accommodation: 90000,
      activities: 20000,
      food: 20000,
      other: 10000
    },
    userId: 'user-mock-1'
  }
];

// Initialize localStorage databases if not present
const initMockDb = () => {
  if (!localStorage.getItem('globetrotter_users')) {
    localStorage.setItem('globetrotter_users', JSON.stringify([
      { id: 'user-mock-1', name: 'Adventurous Explorer', email: 'traveler@globetrotter.com', password: 'password123' }
    ]));
  }
  if (!localStorage.getItem('globetrotter_trips')) {
    localStorage.setItem('globetrotter_trips', JSON.stringify(INITIAL_TRIPS));
  }
};

initMockDb();

// Helper mock functions
const getMockUsers = (): any[] => JSON.parse(localStorage.getItem('globetrotter_users') || '[]');
const getMockTrips = (): Trip[] => JSON.parse(localStorage.getItem('globetrotter_trips') || '[]');
const saveMockTrips = (trips: Trip[]) => localStorage.setItem('globetrotter_trips', JSON.stringify(trips));
const getMockCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('globetrotter_user');
  return userJson ? JSON.parse(userJson) : null;
};

// ==========================================
// AUTHENTICATION API SERVICES
// ==========================================

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('globetrotter_token', res.data.token);
    localStorage.setItem('globetrotter_user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (error) {
    console.warn('[API] Real API login failed, falling back to mock database', error);
    
    // Mock implementation
    const users = getMockUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (matchedUser) {
      const user: User = { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email, token: 'mock-jwt-token-' + matchedUser.id };
      localStorage.setItem('globetrotter_token', user.token!);
      localStorage.setItem('globetrotter_user', JSON.stringify(user));
      return user;
    } else {
      throw new Error('Invalid email or password credentials');
    }
  }
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('globetrotter_token', res.data.token);
    localStorage.setItem('globetrotter_user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (error) {
    console.warn('[API] Real API register failed, falling back to mock database', error);

    // Mock implementation
    const users = getMockUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const newUser = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem('globetrotter_users', JSON.stringify(users));

    const user: User = { id: newUser.id, name: newUser.name, email: newUser.email, token: 'mock-jwt-token-' + newUser.id };
    localStorage.setItem('globetrotter_token', user.token!);
    localStorage.setItem('globetrotter_user', JSON.stringify(user));
    return user;
  }
};

export const getMe = async (): Promise<User | null> => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (error) {
    console.warn('[API] Real API getMe failed, returning local cached user', error);
    return getMockCurrentUser();
  }
};

export const logout = () => {
  localStorage.removeItem('globetrotter_token');
  localStorage.removeItem('globetrotter_user');
};

// ==========================================
// TRIPS API SERVICES
// ==========================================

export const getTrips = async (): Promise<Trip[]> => {
  try {
    const res = await api.get('/trips');
    return res.data;
  } catch (error) {
    console.warn('[API] Real API getTrips failed, using mock data', error);
    
    // Filter trips by logged-in user to simulate realistic behavior
    const currentUser = getMockCurrentUser();
    const allTrips = getMockTrips();
    if (!currentUser) return [];
    return allTrips.filter(t => t.userId === currentUser.id);
  }
};

export const getTrip = async (id: string): Promise<Trip> => {
  try {
    const res = await api.get(`/trips/${id}`);
    return res.data;
  } catch (error) {
    console.warn(`[API] Real API getTrip(${id}) failed, fetching from mock data`, error);
    
    const trips = getMockTrips();
    const trip = trips.find(t => t.id === id);
    if (!trip) {
      throw new Error(`Trip with ID ${id} not found.`);
    }
    return trip;
  }
};

export const createTrip = async (data: TripFormData): Promise<Trip> => {
  try {
    const res = await api.post('/trips', data);
    return res.data;
  } catch (error) {
    console.warn('[API] Real API createTrip failed, creating locally', error);

    const currentUser = getMockCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required to create a trip.');
    }

    const trips = getMockTrips();
    const newTrip: Trip = {
      id: 'trip-' + Math.random().toString(36).substr(2, 9),
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      destinations: [],
      activities: [],
      budget: {
        totalBudget: data.totalBudget || 50000,
        transport: Math.round((data.totalBudget || 50000) * 0.25),
        accommodation: Math.round((data.totalBudget || 50000) * 0.35),
        activities: Math.round((data.totalBudget || 50000) * 0.20),
        food: Math.round((data.totalBudget || 50000) * 0.10),
        other: Math.round((data.totalBudget || 50000) * 0.10),
      },
      userId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    trips.unshift(newTrip); // Add to the front
    saveMockTrips(trips);
    return newTrip;
  }
};

export const updateTrip = async (id: string, data: Partial<Trip>): Promise<Trip> => {
  try {
    const res = await api.put(`/trips/${id}`, data);
    return res.data;
  } catch (error) {
    console.warn(`[API] Real API updateTrip(${id}) failed, updating locally`, error);

    const trips = getMockTrips();
    const tripIndex = trips.findIndex(t => t.id === id);
    if (tripIndex === -1) {
      throw new Error(`Trip with ID ${id} not found.`);
    }

    const currentTrip = trips[tripIndex];
    const updatedTrip: Trip = {
      ...currentTrip,
      ...data,
      // Ensure complex objects aren't clobbered incorrectly if partial update is simplified
      budget: data.budget ? { ...currentTrip.budget, ...data.budget } as Budget : currentTrip.budget
    };

    trips[tripIndex] = updatedTrip;
    saveMockTrips(trips);
    return updatedTrip;
  }
};

export const deleteTrip = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/trips/${id}`);
    return true;
  } catch (error) {
    console.warn(`[API] Real API deleteTrip(${id}) failed, deleting locally`, error);

    const trips = getMockTrips();
    const filteredTrips = trips.filter(t => t.id !== id);
    saveMockTrips(filteredTrips);
    return true;
  }
};

// Auxiliary helper for static destination lists (Dashboard / City Discovery card search)
export const getPopularDestinations = async (): Promise<Destination[]> => {
  return POPULAR_DESTINATIONS;
};
