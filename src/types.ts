export interface GymUser {
  id: number;
  uid?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  membershipType: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
}

export interface Workout {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  exercise: string;
  duration: number; // minutes
  calories: number; // kcal
  weight?: number | null; // kg
  createdAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  planName: string;
  price: number; // ₹
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface GymTrainer {
  name: string;
  role: string;
  specialty: string;
  experience: string;
  bio: string;
  image: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface AuthState {
  token: string | null;
  user: GymUser | null;
  isAdmin: boolean;
}
