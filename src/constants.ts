import { Car } from "./types";

export const INITIAL_CARS: Omit<Car, "id">[] = [
  {
    name: "Model S Plaid",
    brand: "Tesla",
    type: "Luxury",
    pricePerDay: 250,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000"
    ],
    specs: {
      engine: "Tri-Motor Electric",
      seats: 5,
      mileage: "396 miles",
      fuelType: "Electric",
      transmission: "Automatic"
    },
    description: "The quickest accelerating car in production today. Plaid platform unites powertrain and battery technologies for unrivaled performance, range and efficiency.",
    isFeatured: true
  },
  {
    name: "911 Carrera",
    brand: "Porsche",
    type: "Sports",
    pricePerDay: 350,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
    specs: {
      engine: "3.0L Twin-Turbo Flat-6",
      seats: 2,
      mileage: "18/24 mpg",
      fuelType: "Gasoline",
      transmission: "PDK Automatic"
    },
    description: "The silhouette of the 911 is legendary. It has been the quintessential sports car for over 50 years.",
    isFeatured: true
  },
  {
    name: "G-Wagon G63",
    brand: "Mercedes-Benz",
    type: "SUV",
    pricePerDay: 500,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=1000",
    specs: {
      engine: "4.0L V8 Biturbo",
      seats: 5,
      mileage: "13/16 mpg",
      fuelType: "Gasoline",
      transmission: "9-Speed Automatic"
    },
    description: "An icon of luxury and off-road capability. The G63 combines raw power with unmatched presence.",
    isFeatured: true
  },
  {
    name: "M4 Competition",
    brand: "BMW",
    type: "Sports",
    pricePerDay: 280,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1000",
    specs: {
      engine: "3.0L Twin-Turbo I6",
      seats: 4,
      mileage: "16/23 mpg",
      fuelType: "Gasoline",
      transmission: "8-Speed M Steptronic"
    },
    description: "The BMW M4 Competition Coupe offers a perfect blend of track-ready performance and daily usability.",
    isFeatured: false
  },
  {
    name: "Range Rover Autobiography",
    brand: "Land Rover",
    type: "Luxury",
    pricePerDay: 400,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1606148632349-54344aa19efe?auto=format&fit=crop&q=80&w=1000",
    specs: {
      engine: "4.4L V8 Twin-Turbo",
      seats: 5,
      mileage: "16/21 mpg",
      fuelType: "Gasoline",
      transmission: "8-Speed Automatic"
    },
    description: "The pinnacle of luxury SUVs. Refined, capable, and unmistakably Range Rover.",
    isFeatured: false
  }
];
