# DriveX // Premium Vehicle Rental Platform

DriveX is a high-fidelity car rental web application designed to bridge luxury automotive aesthetics with blazing-fast React architecture. It rejects traditional, clunky web templates in favor of a bespoke visual identity and real-time database synchronization.

## 🎨 Aesthetic Directives

The UI/UX is built across two primary thematic layers:
1. **Spectral Vitreous**: Operational interfaces (Home, Dashboard, Booking) use true black `#050608` canvases combined with neon cyan vector highlights and heavy physical glassmorphism blurs.
2. **Mercurial Obsidian**: Brand storytelling components (About) rely on dark silvers, custom magnetic cursors, smooth-scroll physics, and SVG parallax distortions to mirror the physical feeling of driving a luxury vehicle.

## ⚡ Core Features

*   **Dynamic Intelligence Panel**: A role-protected `/admin` dashboard that uses Firebase `onSnapshot` WebSockets to monitor live bookings, fleet activity, and secure user communications instantly without screen refreshes.
*   **Adaptive Fleet Filtering**: Client-side filtering architecture allowing users to fluidly sort inventory (Exotics, SUVs, Sedans). Featured vehicles rely on a localized Fisher-Yates array shuffle for a unique homepage on every load.
*   **Secure Checkout Integration**: Multi-gateway booking framework designed to process and securely encrypt simulated Credit Card (Stripe), Cryptocurrency, and Cash-on-Arrival parameters.
*   **Mobile-First "Etched Relief" Nav**: Desktop UI seamlessly degrades on phones below `768px`. The floating glass nav is entirely swapped for a bottom-anchored, touch-optimized obsidian icon dock.

## 🛠 Technology Stack

*   **Frontend Library**: React 19 / JSX
*   **Build Tool**: Vite (Lightning-fast HMR)
*   **Routing**: React Router v7
*   **Backend & DB**: Firebase (Cloud Firestore & Authentication)
*   **Styling Engine**: Modular CSS-in-JS & Tailwind CSS
*   **Animation**: React Motion & Vanilla Frame Interpolations

---

## 🚀 Local Development Setup

To run DriveX locally, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/sahilsh0310/Car_Rental.git
cd Car_Rental
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
This project relies on `firebase-applet-config.json` for database variables.
Ensure the file exists in your project root with your configuration keys:
```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "drivex-app.firebaseapp.com",
  "projectId": "drivex-app",
  "storageBucket": "drivex-app.firebasestorage.app",
  "messagingSenderId": "123456789",
  "appId": "1:12345:web:abcdef"
}
```

### 4. Run the Local Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## 🔒 Security Practices

- Client-side document writes are strictly blocked natively unless wrapped in `isAuthenticated()` checks.
- Sensitive Dashboard endpoints require active parsing of the Google Auth payload and verification of `role: "admin"`.
- Deployed through Vercel with strict Authorized Domain routing.

## 📝 Roadmap

- [ ] Implementation of full Firebase Admin Node.js bindings.
- [ ] Linking mock-Stripe UI elements to a secure backend webhook flow.
- [ ] Porting the "Etched Relief" CSS structure into a React Native framework for the App Store.

---
*SYS.OPTIMAL // END OF LINE*



## 📝 Roadmap

- [ ] Implementation of full Firebase Admin Node.js bindings.
- [ ] Linking mock-Stripe UI elements to a secure backend webhook flow.
- [ ] Porting the "Etched Relief" CSS structure into a React Native framework for the App Store.

---
*SYS.OPTIMAL // END OF LINE*