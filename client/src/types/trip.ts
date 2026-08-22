export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  region?: string;
  costIndex?: number; // 1-5 budget indicator
  popularity?: string;
  image?: string;
  description?: string;
}

export interface Activity {
  id: string;
  name: string;
  category: 'Transport' | 'Accommodation' | 'Activities' | 'Food' | 'Other';
  duration?: string;
  cost: number;
  description?: string;
  startTime?: string; // e.g. "10:00"
  endTime?: string; // e.g. "12:00"
  date?: string; // e.g. "2026-09-10"
  location?: string;
}

export interface Budget {
  id?: string;
  totalBudget: number;
  transport: number;
  accommodation: number;
  activities: number;
  food: number;
  other: number;
}

export interface TimelineItem {
  id: string;
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  cost?: number;
  category?: 'Transport' | 'Accommodation' | 'Activities' | 'Food' | 'Other';
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  coverImage?: string;
  destinations: Destination[];
  activities: Activity[];
  budget?: Budget;
  userId: string;
  createdAt?: string;
}

export interface TripFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImage: string;
  totalBudget?: number;
}
