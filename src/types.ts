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
  carId: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  totalPrice: number;
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
}
