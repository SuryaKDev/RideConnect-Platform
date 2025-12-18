// Mock authentication system using localStorage
// For production, replace with a real backend
import { api } from './api';

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
    profilePhoto?: string;
    token?: string; // Added for JWT
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
    const users = getUsersSync();
    let hasChanges = false;

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
        hasChanges = true;
    }

    if (!users.find(u => u.email === 'passenger@demo.com')) {
        const passengerUser: User = {
            id: 'passenger-demo',
            name: 'John Doe',
            email: 'passenger@demo.com',
            phone: '1234567890',
            role: 'passenger',
            createdAt: new Date().toISOString(),
            isVerified: true,
            isBlocked: false,
        };
        users.push(passengerUser);
        hasChanges = true;
    }

    if (!users.find(u => u.email === 'driver@demo.com')) {
        const driverUser: User = {
            id: 'driver-demo',
            name: 'Jane Smith',
            email: 'driver@demo.com',
            phone: '0987654321',
            role: 'driver',
            createdAt: new Date().toISOString(),
            isVerified: true,
            isBlocked: false,
            vehicleModel: 'Toyota Camry',
            licensePlate: 'KA-01-AB-1234',
            vehicleCapacity: 4,
        };
        users.push(driverUser);
        hasChanges = true;
    }

    if (hasChanges) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};

// Helper for sync access within this file only
const getUsersSync = (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
};

const getRidesSync = (): Ride[] => {
    const data = localStorage.getItem(RIDES_KEY);
    return data ? JSON.parse(data) : [];
};

// Async exports for UI consumption

export const getUsers = async (): Promise<User[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getUsersSync();
};

export const getRides = async (): Promise<Ride[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getRidesSync();
};

export const saveRides = async (rides: Ride[]) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
};

export const getCurrentUser = (): User | null => {
    // This can remain sync as it reads from local session state
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
};

export const signIn = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network request

    initializeData();
    const users = getUsersSync();

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

export const signUp = async (userData: Omit<User, 'id' | 'createdAt' | 'isVerified' | 'isBlocked'>): Promise<{ success: boolean; user?: User; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsersSync();

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

export const signOut = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getUsersSync();
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

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, verify current password hash
    // For mock, we just assume success if user exists
    const users = getUsersSync();
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
        // Here we would update the password hash
        return { success: true };
    }
    return { success: false, error: "User not found" };
};

export const deleteUser = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = getUsersSync().filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const createRide = async (ride: Omit<Ride, 'id' | 'passengers' | 'status' | 'availableSeats'>): Promise<Ride> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const rides = getRidesSync();
    const newRide: Ride = {
        ...ride,
        id: `ride-${Date.now()}`,
        availableSeats: ride.seats,
        passengers: [],
        status: 'active',
    };
    rides.push(newRide);
    localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
    return newRide;
};

export const bookRide = async (rideId: string, passengerId: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const rides = getRidesSync();
    const ride = rides.find(r => r.id === rideId);

    if (!ride) return { success: false, error: 'Ride not found' };
    if (ride.availableSeats <= 0) return { success: false, error: 'No seats available' };
    if (ride.passengers.includes(passengerId)) return { success: false, error: 'Already booked' };

    ride.passengers.push(passengerId);
    ride.availableSeats -= 1;
    localStorage.setItem(RIDES_KEY, JSON.stringify(rides));

    return { success: true };
};

initializeData();
