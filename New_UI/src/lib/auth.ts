// Mock authentication system using localStorage
// For production, replace with a real backend

export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  isVerified: boolean;
  isBlocked: boolean;
  blockReason?: string;
  // Driver-specific fields
  vehicleModel?: string;
  licensePlate?: string;
  vehicleCapacity?: number;
  vehiclePhoto?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  duration: string;
  seats: number;
  availableSeats: number;
  price: number;
  passengers: string[];
  status: 'active' | 'completed' | 'cancelled';
}

const USERS_KEY = 'rideconnect_users';
const CURRENT_USER_KEY = 'rideconnect_current_user';
const RIDES_KEY = 'rideconnect_rides';

// Initialize with admin user
const initializeData = () => {
  const users = getUsers();
  if (!users.find(u => u.email === 'admin@rideconnect.com')) {
    const adminUser: User = {
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@rideconnect.com',
      phone: '0000000000',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isVerified: true,
      isBlocked: false,
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getRides = (): Ride[] => {
  const data = localStorage.getItem(RIDES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRides = (rides: Ride[]) => {
  localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const signIn = (email: string, password: string): { success: boolean; user?: User; error?: string } => {
  initializeData();
  const users = getUsers();
  
  // Admin login check
  if (email === 'admin@rideconnect.com' && password === 'admin123') {
    const admin = users.find(u => u.email === 'admin@rideconnect.com');
    if (admin) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(admin));
      return { success: true, user: admin };
    }
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.isBlocked) {
    return { success: false, error: `Account blocked: ${user.blockReason || 'No reason provided'}` };
  }
  
  // In a real app, you'd verify the password hash
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
};

export const signUp = (userData: Omit<User, 'id' | 'createdAt' | 'isVerified' | 'isBlocked'>): { success: boolean; user?: User; error?: string } => {
  const users = getUsers();
  
  if (users.find(u => u.email === userData.email)) {
    return { success: false, error: 'Email already registered' };
  }
  
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isVerified: false,
    isBlocked: false,
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  return { success: true, user: newUser };
};

export const signOut = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUser = (userId: string, updates: Partial<User>) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[index]));
    }
  }
};

export const deleteUser = (userId: string) => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const createRide = (ride: Omit<Ride, 'id' | 'passengers' | 'status' | 'availableSeats'>): Ride => {
  const rides = getRides();
  const newRide: Ride = {
    ...ride,
    id: `ride-${Date.now()}`,
    availableSeats: ride.seats,
    passengers: [],
    status: 'active',
  };
  rides.push(newRide);
  saveRides(rides);
  return newRide;
};

export const bookRide = (rideId: string, passengerId: string): { success: boolean; error?: string } => {
  const rides = getRides();
  const ride = rides.find(r => r.id === rideId);
  
  if (!ride) return { success: false, error: 'Ride not found' };
  if (ride.availableSeats <= 0) return { success: false, error: 'No seats available' };
  if (ride.passengers.includes(passengerId)) return { success: false, error: 'Already booked' };
  
  ride.passengers.push(passengerId);
  ride.availableSeats -= 1;
  saveRides(rides);
  
  return { success: true };
};

initializeData();
