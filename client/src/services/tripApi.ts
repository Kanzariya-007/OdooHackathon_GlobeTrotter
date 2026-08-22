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

// ==========================================
// CITIES & ACTIVITIES DISCOVERY DATA
// ==========================================

const DISCOVERABLE_CITIES: Destination[] = [
  ...POPULAR_DESTINATIONS,
  {
    id: 'dest-6',
    city: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    costIndex: 4,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    description: 'A historic capital featuring Big Ben, the Tower of London, and world-class West End shows.'
  },
  {
    id: 'dest-7',
    city: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 4,
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
    description: 'An iconic harbor city famed for its Opera House, surf beaches, and sunny climate.'
  },
  {
    id: 'dest-8',
    city: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    costIndex: 2,
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
    description: 'A stunning coastal city situated beneath the majestic Table Mountain.'
  },
  {
    id: 'dest-9',
    city: 'Cairo',
    country: 'Egypt',
    region: 'Middle East',
    costIndex: 1,
    popularity: 'Medium',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
    description: 'Home of the ancient Giza Pyramid Complex and the historic Nile River.'
  },
  {
    id: 'dest-10',
    city: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    costIndex: 2,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
    description: 'A bustling capital known for ornate shrines, vibrant street life, and shopping.'
  },
  {
    id: 'dest-11',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 3,
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efedd?auto=format&fit=crop&w=600&q=80',
    description: 'Famed for Sagrada Familia cathedral, Gaudi architecture, and sandy beaches.'
  },
  {
    id: 'dest-12',
    city: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    costIndex: 5,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    description: 'An ultra-modern luxury hub featuring Burj Khalifa and massive shopping malls.'
  },
  {
    id: 'dest-13',
    city: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 'Very High',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    description: 'A tropical paradise of forested volcanic mountains, beaches, and coral reefs.'
  },
  {
    id: 'dest-14',
    city: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    costIndex: 4,
    popularity: 'High',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80',
    description: 'Charming network of canals, artistic heritage, and historic narrow houses.'
  },
  {
    id: 'dest-15',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    costIndex: 3,
    popularity: 'Medium',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80',
    description: 'Energetic seaside city famous for Copacabana, Carnival, and Christ the Redeemer.'
  }
];

const DISCOVERABLE_ACTIVITIES: Record<string, Partial<Activity>[]> = {
  paris: [
    { name: 'Eiffel Tower Guided Summit Tour', category: 'Activities', duration: '3 hours', cost: 8000, description: 'Guided skip-the-line elevator entry to the summit deck.' },
    { name: 'Louvre Museum Masterpieces Tour', category: 'Activities', duration: '2.5 hours', cost: 6500, description: 'See the Mona Lisa, Venus de Milo and other priceless works.' },
    { name: 'Seine River Cruise with Dinner', category: 'Food', duration: '2 hours', cost: 9500, description: 'Gourmet 3-course meal on a glass-walled boat passing Paris landmarks.' },
    { name: 'Palace of Versailles Half-Day Trip', category: 'Activities', duration: '4.5 hours', cost: 7200, description: 'Explore the Hall of Mirrors and magnificent gardens with audio guide.' },
    { name: 'Montmartre Walking & Wine Tasting', category: 'Food', duration: '3 hours', cost: 5000, description: 'Walk artistic streets, visit vineyards, and taste French wines.' },
    { name: 'Paris Metro Day Pass', category: 'Transport', duration: '1 day', cost: 1200, description: 'Unlimited transport inside Paris Zones 1-3.' }
  ],
  tokyo: [
    { name: 'Shibuya Crossing & Hachiko Guided Tour', category: 'Activities', duration: '1.5 hours', cost: 1500, description: 'Explore Shibuya and local hidden alleyways with a guide.' },
    { name: 'Sushi Dai Tsukiji Breakfast Experience', category: 'Food', duration: '1.5 hours', cost: 4500, description: 'World-class chef selection sushi breakfast at Outer Market.' },
    { name: 'Robot Restaurant Cabaret Show', category: 'Activities', duration: '2 hours', cost: 6000, description: 'Sensory overload featuring giant robots, neon lights, and drum shows.' },
    { name: 'Mt. Fuji & Hakone Guided Day Tour', category: 'Activities', duration: '10 hours', cost: 12000, description: 'Day trip to Fuji 5th station, Lake Ashi cruise, and cable car ride.' },
    { name: 'Akihabara Anime & Gaming Tour', category: 'Activities', duration: '3 hours', cost: 3500, description: 'Visit maid cafes, retro arcades, and collector shops.' },
    { name: 'JR Rail Pass (7 Days)', category: 'Transport', duration: '7 days', cost: 30000, description: 'Unlimited travel on Shinkansen and JR train lines across Japan.' }
  ],
  rome: [
    { name: 'Colosseum & Roman Forum Walk', category: 'Activities', duration: '3 hours', cost: 5000, description: 'Walk the arena floor and hear stories of gladiators.' },
    { name: 'Vatican Museums & Sistine Chapel Tour', category: 'Activities', duration: '4.5 hours', cost: 7500, description: 'Marvel at Michelangelo frescoes and Renaissance art galleries.' },
    { name: 'Trastevere Food Tour & Wine Pairing', category: 'Food', duration: '3.5 hours', cost: 6800, description: 'Sample Roman specialties: Cacio e Pepe, supplì, pizza, and organic wines.' },
    { name: 'Pasta & Tiramisu Making Class', category: 'Food', duration: '3 hours', cost: 5500, description: 'Roll your own pasta and construct tiramisu with a local Italian chef.' },
    { name: 'Rome Hop-On Hop-Off Bus Tour', category: 'Transport', duration: '24 hours', cost: 2200, description: 'Sightseeing double-decker bus covering major landmarks.' }
  ],
  goa: [
    { name: 'Dudhsagar Waterfalls Trek & Jeep Safari', category: 'Activities', duration: '6 hours', cost: 3000, description: 'Jeep ride through jungle to the four-tiered waterfall, including lunch.' },
    { name: 'South Goa Heritage & Spice Plantation Tour', category: 'Activities', duration: '5 hours', cost: 1800, description: 'Visit historic Portuguese churches and enjoy organic buffet lunch.' },
    { name: 'Scuba Diving at Grande Island', category: 'Activities', duration: '7 hours', cost: 4500, description: 'PADI guided shallow dives, boat trip, dolphin sighting, and BBQ lunch.' },
    { name: 'Candolim Beach Water Sports Package', category: 'Activities', duration: '2 hours', cost: 2500, description: 'Parasailing, jet ski, banana boat ride, and bumper ride.' },
    { name: 'Beachside Seafood Dinner at Curlies', category: 'Food', duration: '2 hours', cost: 1500, description: 'Fresh Goan fish curry, prawns, and local drinks by the waves.' }
  ],
  'new york': [
    { name: 'Empire State Building Observatory Ticket', category: 'Activities', duration: '2 hours', cost: 3800, description: '360-degree views of Manhattan from the 86th floor open-air deck.' },
    { name: 'Statue of Liberty & Ellis Island Ferry', category: 'Activities', duration: '4 hours', cost: 2500, description: 'Access to Liberty Island pedestal museum and Ellis Island national archives.' },
    { name: 'Broadway Show (Wicked / Lion King)', category: 'Activities', duration: '2.5 hours', cost: 9500, description: 'Premium seats at a classic Broadway musical theatre show.' },
    { name: 'Manhattan Helicopter Sightseeing Flight', category: 'Activities', duration: '15 mins', cost: 18000, description: 'Aerial tour of Statue of Liberty, Brooklyn Bridge, and Central Park.' },
    { name: 'Chelsea Market & High Line Food Tour', category: 'Food', duration: '3 hours', cost: 6000, description: 'Eat local tacos, artisanal cheese, doughnuts, and walk the linear park.' },
    { name: 'New York Subway Week Pass', category: 'Transport', duration: '7 days', cost: 2800, description: 'MTA unlimited subway and local bus pass.' }
  ]
};

export const getCities = async (): Promise<Destination[]> => {
  return DISCOVERABLE_CITIES;
};

export const getActivitiesForCity = async (cityName: string): Promise<Partial<Activity>[]> => {
  const key = cityName.toLowerCase();
  if (DISCOVERABLE_ACTIVITIES[key]) {
    return DISCOVERABLE_ACTIVITIES[key];
  }
  // Default fallback activities for other cities
  return [
    { name: `${cityName} City Sightseeing Tour`, category: 'Activities', duration: '3 hours', cost: 2500, description: `Guided overview tour of ${cityName}'s historic points of interest.` },
    { name: `Traditional Culinary Experience in ${cityName}`, category: 'Food', duration: '2 hours', cost: 3000, description: 'Sample authentic regional dishes at a popular local tavern.' },
    { name: `Grand Plaza Hotel ${cityName}`, category: 'Accommodation', duration: '1 night', cost: 8000, description: 'Comfortable stay in the central neighborhood close to attractions.' },
    { name: `Private Airport Shuttle Transfer`, category: 'Transport', duration: '45 mins', cost: 1500, description: 'Convenient one-way pickup or drop-off direct to your terminal.' }
  ];
};

