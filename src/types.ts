export interface Car {
  id: string;
  name: string;
  brand: string;
  type: "Sedan" | "SUV" | "Sports" | "Luxury" | "Convertible";
  pricePerDay: number;
  rating: number;
  image: string;
  images?: string[];
  specs: {
    engine: string;
    seats: number;
    mileage: string;
    fuelType: string;
    transmission: string;
  };
  description: string;
  isFeatured: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userEmail?: string;
  carId: string;
  // Snapshot fields stored at booking time for easy display
  carName?: string;
  carBrand?: string;
  carImage?: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  totalPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  driverName?: string;
  paymentMethod?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "user" | "admin";
  wishlist?: string[];
  phone?: string;
  createdAt?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied";
}

