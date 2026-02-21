const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ---------- Auth helpers ----------
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };
}

// ---------- Types ----------
export interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "expert";
    phone: string;
}

export interface Expert {
    _id: string;
    userId?: string;
    name: string;
    email?: string;
    phone?: string;
    category: string;
    experience: number;
    rating: number;
    bio: string;
    profileImage: string;
    availableSlots: TimeSlot[];
}

export interface TimeSlot {
    date: string;
    time: string;
    isBooked: boolean;
    isBlocked?: boolean;  // Only used in expert dashboard
}

export interface Booking {
    _id: string;
    expertId: string;
    userId: string;
    expertName: string;
    userName: string;
    email: string;
    phone: string;
    date: string;
    timeSlot: string;
    notes: string;
    status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
    createdAt: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: "booking_request" | "booking_accepted" | "booking_rejected" | "booking_cancelled";
    message: string;
    bookingId: string;
    isRead: boolean;
    createdAt: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalExperts: number;
    hasMore: boolean;
}

export interface ExpertsResponse {
    experts: Expert[];
    pagination: PaginationInfo;
}

// ---------- Auth API ----------
export async function signupApi(data: {
    name: string;
    email: string;
    password: string;
    role: "user" | "expert";
    phone?: string;
    category?: string;
    bio?: string;
    experience?: number;
}): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Signup failed");
    return json;
}

export async function loginApi(data: {
    email: string;
    password: string;
}): Promise<{ message: string; token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Login failed");
    return json;
}

export async function getMeApi(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
}

// ---------- Expert API ----------
export async function fetchExperts(
    page = 1,
    limit = 8,
    search = "",
    category = ""
): Promise<ExpertsResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const res = await fetch(`${API_BASE}/experts?${params}`);
    if (!res.ok) throw new Error("Failed to fetch experts");
    return res.json();
}

export async function fetchExpertById(id: string): Promise<Expert> {
    const res = await fetch(`${API_BASE}/experts/${id}`);
    if (!res.ok) throw new Error("Failed to fetch expert");
    return res.json();
}

export async function fetchCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/experts/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

// ---------- Expert Slot Management API ----------
export async function fetchMySlots(): Promise<{
    slots: TimeSlot[];
}> {
    const res = await fetch(`${API_BASE}/experts/my-slots`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch slots");
    return res.json();
}

export async function toggleSlot(data: {
    date: string;
    time: string;
}): Promise<{ message: string; available: boolean }> {
    const res = await fetch(`${API_BASE}/experts/my-slots/toggle`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to toggle slot");
    return json;
}

// ---------- Booking API ----------
export async function createBooking(data: {
    expertId: string;
    date: string;
    timeSlot: string;
    notes?: string;
}): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create booking");
    return json;
}

export async function fetchMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
}

export async function fetchExpertBookings(): Promise<Booking[]> {
    const res = await fetch(`${API_BASE}/bookings/expert`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
}

export async function respondToBooking(
    id: string,
    status: "confirmed" | "rejected"
): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/respond`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to respond to booking");
    return json;
}

export async function cancelBooking(
    id: string
): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to cancel booking");
    return json;
}

// ---------- Notification API ----------
export async function fetchNotifications(): Promise<{
    notifications: Notification[];
    unreadCount: number;
}> {
    const res = await fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
}

export async function markNotificationRead(
    id: string
): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    return res.json();
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to mark all notifications as read");
    return res.json();
}
