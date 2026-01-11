// src/services/api.js

const API_URL = "http://localhost:8080/api";

// Helper function to handle headers and tokens automatically
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token"); // <--- Get JWT from storage
  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // <--- Attach it!
  }
  return headers;
};
// --- AUTH SERVICES ---

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // Response is not JSON
  }

  if (!response.ok) {
    throw new Error(data?.message || text || "Login failed");
  }

  // SAVE THE TOKEN AUTOMATICALLY
  if (data && data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // Response is not JSON
  }

  if (!response.ok) {
    throw new Error(data?.message || text || "Registration failed");
  }

  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  window.location.href = "/login"; // Force redirect
};


// --- RIDE SERVICES ---

export const postRide = async (rideData) => {
  const response = await fetch(`${API_URL}/rides/post`, {
    method: "POST",
    headers: getHeaders(), // <--- Uses the helper to attach token
    body: JSON.stringify(rideData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to post ride");
  return data;
};

export const calculateFare = async (source, destination) => {
  const response = await fetch(`${API_URL}/rides/calculate?source=${source}&destination=${destination}`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to calculate fare");
  return data;
};

// --- UPDATED SEARCH FUNCTION ---
export const searchRides = async (filters) => {
  // filters is an object like: { source: '...', minPrice: 500, ... }

  // Remove empty keys to keep URL clean
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });

  const response = await fetch(`${API_URL}/rides/search?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Search failed");
  return data;
};

// --- BOOKING SERVICES ---

export const bookRide = async (rideId, seats) => {
  const response = await fetch(`${API_URL}/bookings/book?rideId=${rideId}&seats=${seats}`, {
    method: "POST",
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Booking failed");
  return data;
};

export const getMyBookings = async () => {
  const response = await fetch(`${API_URL}/bookings/my-bookings`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch bookings");
  return data;
};

// Get rides posted by current driver
export const getMyRides = async () => {
  const response = await fetch(`${API_URL}/rides/my-rides`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch my rides");
  return data;
};

// --- ADMIN SERVICES ---

export const getAllUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch users");
  return data;
};

export const getAllBookings = async () => {
  const response = await fetch(`${API_URL}/admin/bookings`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch bookings");
  return data;
};

export const getAllRides = async () => {
  // MOCK DELAY
  await new Promise(resolve => setTimeout(resolve, 800));

  // DUMMY RIDES FOR ADMIN CONSOLE UI
  return [
    {
      id: 1001,
      driver: { name: "Kumar V", phone: "9876543210" },
      source: "Chennai, Tamil Nadu",
      destination: "Coimbatore, Tamil Nadu",
      status: "IN_PROGRESS",
      pricePerSeat: 850,
      availableSeats: 2,
      startTime: new Date().toISOString()
    },
    {
      id: 1002,
      driver: { name: "Alex Johnson", phone: "9123456780" },
      source: "Bangalore, Karnataka",
      destination: "Mysore, Karnataka",
      status: "AVAILABLE",
      pricePerSeat: 450,
      availableSeats: 3,
      startTime: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: 1003,
      driver: { name: "Rajesh K", phone: "8887776665" },
      source: "Hyderabad, Telangana",
      destination: "Vijayawada, AP",
      status: "COMPLETED",
      pricePerSeat: 600,
      availableSeats: 0,
      startTime: "2023-11-10T10:00:00Z"
    },
    {
      id: 1004,
      driver: { name: "Sneha G", phone: "7776665554" },
      source: "Mumbai, Maharashtra",
      destination: "Pune, Maharashtra",
      status: "CANCELLED",
      pricePerSeat: 300,
      availableSeats: 4,
      startTime: "2023-11-12T09:00:00Z"
    }
  ];
};

// Fetch Dashboard Stats
export const getAdminStats = async () => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch stats");
  return data;
};

export const verifyDriver = async (driverId) => {
  const response = await fetch(`${API_URL}/admin/verify-driver/${driverId}`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to verify driver");
  return data;
};

export const blockUser = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to block user");
  return data;
};

export const cancelRide = async (rideId) => {
  const response = await fetch(`${API_URL}/admin/rides/${rideId}/cancel`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to cancel ride");
  return data;
};

export const cancelRideAdmin = async (rideId, reason) => {
  const response = await fetch(`${API_URL}/admin/rides/${rideId}/cancel`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ reason }), // Send reason in body
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to cancel ride");
  return data;
};

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch profile");
  return data;
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update profile");
  return data;
};

// --- PAYMENT SERVICES ---

export const createOrder = async (bookingId) => {
  const response = await fetch(`${API_URL}/payments/create-order`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ bookingId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create order");
  return data;
};

export const verifyPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/payments/verify`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(paymentData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Payment verification failed");
  return data;
};

export const getTransactionHistory = async () => {
  const response = await fetch(`${API_URL}/payments/history`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch history");
  return data;
};

export const cancelBooking = async (bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to cancel booking");
  return data;
};

export const cancelPublishedRide = async (rideId) => {
  const response = await fetch(`${API_URL}/rides/${rideId}/cancel`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to cancel ride");
  return data;
};

// Fetch passengers for a specific ride
export const getRidePassengers = async (rideId) => {
  const response = await fetch(`${API_URL}/rides/${rideId}/bookings`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch passengers");
  return data;
};

// --- DRIVER ACTIONS ---
export const acceptBookingRequest = async (bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/accept`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to accept booking");
  return data;
};

export const getDriverStats = async () => {
  const response = await fetch(`${API_URL}/payments/driver-stats`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch stats");
  return data;
};

export const rejectBookingRequest = async (bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/reject`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to reject booking");
  return data;
};

// --- RIDE LIFECYCLE (Driver) ---

export const startRide = async (rideId) => {
  const response = await fetch(`${API_URL}/rides/${rideId}/start`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to start ride");
  return data;
};

export const completeRide = async (rideId) => {
  const response = await fetch(`${API_URL}/rides/${rideId}/complete`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to complete ride");
  return data;
};

// --- REVIEW SERVICES ---

export const submitReview = async (bookingId, rating, comment) => {
  // MOCK DELAY
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: Math.floor(Math.random() * 1000),
    bookingId,
    rating,
    comment,
    createdAt: new Date().toISOString()
  };
};

export const getMyReviews = async () => {
  // MOCK DELAY
  await new Promise(resolve => setTimeout(resolve, 600));

  // MOCK DATA
  return [
    {
      id: 101,
      reviewerName: "Priya Sharma",
      reviewerProfilePicture: "https://i.pravatar.cc/300?img=5",
      rating: 5,
      comment: "Absolutely amazing ride! The car was super clean and Alex was very polite.",
      createdAt: "2025-10-15T10:30:00Z"
    },
    {
      id: 102,
      reviewerName: "Rahul Verma",
      reviewerProfilePicture: "https://i.pravatar.cc/300?img=3",
      rating: 4,
      comment: "Good drive, but arrived 5 mins late due to traffic.",
      createdAt: "2025-10-12T08:15:00Z"
    }
  ];
};

// --- PUBLIC PROFILE SERVICE ---
// --- PUBLIC PROFILE SERVICE (MOCKED) ---
export const getUserPublicProfile = async (userId) => {
  // MOCK DELAY
  await new Promise(resolve => setTimeout(resolve, 600));

  // DUMMY DATA FOR UI TESTING
  return {
    id: userId,
    name: "Alex Johnson",
    email: "alex.driver@example.com",
    phone: "+91 98765 43210",
    role: "DRIVER",
    profilePictureUrl: "https://i.pravatar.cc/300?img=11",
    bio: "Professional driver with 5 years of experience. I love meeting new people and ensuring a safe ride.",
    vehicleModel: "Toyota Innova Crysta",
    licensePlate: "TS 09 AB 1234",
    carImageUrl: "https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/innova-hycross-exterior-right-front-three-quarter-73.jpeg?isig=0&q=80",
    carFeatures: "AC, Music System, Extra Legroom, WiFi",
    averageRating: 4.8,
    totalReviews: 124,
    reviews: [
      {
        reviewerName: "Priya Sharma",
        reviewerProfilePicture: "https://i.pravatar.cc/300?img=5",
        rating: 5,
        comment: "Absolutely amazing ride! The car was super clean and Alex was very polite.",
        createdAt: "2025-10-15T10:30:00Z"
      },
      {
        reviewerName: "Rahul Verma",
        reviewerProfilePicture: "https://i.pravatar.cc/300?img=3",
        rating: 4,
        comment: "Good drive, but arrived 5 mins late due to traffic.",
        createdAt: "2025-10-12T08:15:00Z"
      },
      {
        reviewerName: "Sneha Gupta",
        reviewerProfilePicture: null,
        rating: 5,
        comment: "Very safe driver. Highly recommended for female travelers.",
        createdAt: "2025-09-28T14:20:00Z"
      }
    ]
  };
};

// --- FILE UPLOAD SERVICE ---
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // Note: Do NOT set Content-Type header manually for FormData. 
  // The browser sets it automatically with the correct boundary.
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      // "Content-Type": "multipart/form-data", // <--- DO NOT ADD THIS
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Image upload failed");
  return data.url; // Returns the Cloudinary URL
};

export const getRecentRoutes = async () => {
  const response = await fetch(`${API_URL}/bookings/recent-routes`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch routes");
  return data;
};

export const getActiveRide = async () => {
  const response = await fetch(`${API_URL}/bookings/active-ride`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (response.status === 204) return null; // Handle empty
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch active ride");
  return data;
};

// --- NOTIFICATION SERVICES ---

export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch notifications");
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to mark notification as read");
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PUT",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to mark all notifications as read");
  return data;
};