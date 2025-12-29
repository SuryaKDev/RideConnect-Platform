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
  // Fix: Send rideId and seats as query parameters
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
  const response = await fetch(`${API_URL}/rides/all`, {
    method: "GET",
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch rides");
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
    const response = await fetch(`${API_URL}/reviews/submit`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ bookingId, rating, comment }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to submit review");
    return data;
};

export const getMyReviews = async () => {
    const response = await fetch(`${API_URL}/reviews/my-reviews`, {
        method: "GET",
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch reviews");
    return data;
};

// --- PUBLIC PROFILE SERVICE ---
export const getUserPublicProfile = async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "GET",
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch user profile");
    return data;
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