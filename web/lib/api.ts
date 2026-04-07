export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenantId") : null;

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export type SearchItem = {
  listingId: string;
  title: string;
  location: string;
  price: number;
  maxGuests: number;
  amenities: string;
  imageUrls: string;
  from: string;
  to: string;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  basePrice: number;
  maxGuests: number;
  amenities: string;
  imageUrls: string;
  active: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  role: string;
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type PriceQuote = {
  checkIn: string;
  checkOut: string;
  nights: number;
  basePricePerNight: number;
  subtotal: number;
  weekendSurcharge: boolean;
  seasonalSurcharge: boolean;
  demandSurcharge: boolean;
  multiplierTotal: number;
  finalPrice: number;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  guestName: string;
  createdAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minBookingValue?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
};

export type Message = {
  id: string;
  listingId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type InvoiceDetail = {
  paymentId?: string;
  bookingId: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  paidAt?: string;
};

export type BookingFull = {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  state: string;
  price: number;
  guestCount: number;
  guestNotes?: string;
  specialRequests?: string;
  createdAt: string;
};

// API helper functions
export const listingsApi = {
  create: (data: Partial<Listing>) => apiFetch<Listing>("/api/listings", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiFetch<Listing>(`/api/listings/${id}`),
  update: (id: string, data: Partial<Listing>) => apiFetch<Listing>(`/api/listings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/api/listings/${id}`, { method: "DELETE" }),
  search: (params: { q?: string; lat?: number; lon?: number; radiusKm?: number; checkIn?: string; checkOut?: string }) => {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.lat !== undefined) query.append("lat", params.lat.toString());
    if (params.lon !== undefined) query.append("lon", params.lon.toString());
    if (params.radiusKm !== undefined) query.append("radiusKm", params.radiusKm.toString());
    if (params.checkIn) query.append("checkIn", params.checkIn);
    if (params.checkOut) query.append("checkOut", params.checkOut);
    return apiFetch<SearchItem[]>(`/api/listings/search?${query}`);
  },
  priceQuote: (id: string, checkIn: string, checkOut: string, coupon?: string) => {
    const q = new URLSearchParams({ checkIn, checkOut });
    if (coupon) q.append("coupon", coupon);
    return apiFetch<PriceQuote>(`/api/listings/${id}/price-quote?${q}`);
  }
};

export const bookingsApi = {
  get: (id: string) => apiFetch<BookingFull>(`/api/bookings/${id}`),
  list: () => apiFetch<BookingFull[]>("/api/bookings"),
  myBookings: () => apiFetch<BookingFull[]>("/api/bookings/my"),
  hold: (data: { listingId: string; checkIn: string; checkOut: string }) =>
    apiFetch<any>("/api/bookings/hold", { method: "POST", body: JSON.stringify(data) }),
  confirm: (id: string) => apiFetch<BookingFull>(`/api/bookings/${id}/confirm`, { method: "POST" }),
  complete: (id: string) => apiFetch<BookingFull>(`/api/bookings/${id}/complete`, { method: "POST" }),
  cancel: (id: string, reason?: string) => apiFetch<BookingFull>(`/api/bookings/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`, { method: "DELETE" }),
  modify: (id: string, data: { checkIn?: string; checkOut?: string; guestCount?: number; guestNotes?: string; specialRequests?: string }) =>
    apiFetch<BookingFull>(`/api/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  invoice: (id: string) => apiFetch<InvoiceDetail>(`/api/invoices/booking/${id}`)
};

export const reviewsApi = {
  getForListing: (listingId: string) => apiFetch<Review[]>(`/api/reviews/listing/${listingId}`),
  submit: (data: { listingId: string; bookingId: string; rating: number; comment: string; guestName: string }) =>
    apiFetch<Review>("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
  getSummary: (listingId: string) => apiFetch<{ averageRating: number; totalReviews: number }>(`/api/reviews/listing/${listingId}/summary`)
};

export const couponsApi = {
  list: () => apiFetch<Coupon[]>("/api/coupons"),
  create: (data: Partial<Coupon>) => apiFetch<Coupon>("/api/coupons", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/api/coupons/${id}`, { method: "DELETE" }),
  validate: (code: string, amount: number) =>
    apiFetch<{ valid: boolean; discountAmount: number; message: string }>(`/api/coupons/validate?code=${code}&amount=${amount}`)
};

export const messagesApi = {
  getThread: (listingId: string) => apiFetch<Message[]>(`/api/messages/listing/${listingId}`),
  send: (listingId: string, body: string) =>
    apiFetch<Message>("/api/messages", { method: "POST", body: JSON.stringify({ listingId, body }) }),
  getMyThreads: () => apiFetch<{ listingId: string; listingTitle: string; lastMessage: Message }[]>("/api/messages/threads")
};

export const usersApi = {
  getProfile: () => apiFetch<UserProfile>("/api/users/profile"),
  updateProfile: (data: Partial<UserProfile>) =>
    apiFetch<UserProfile>("/api/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  deleteProfile: () => apiFetch<void>("/api/users/profile", { method: "DELETE" }),
  list: () => apiFetch<UserProfile[]>("/api/users")
};

