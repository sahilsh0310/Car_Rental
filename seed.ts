import { db } from "./src/lib/firebase";
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore";
import { INITIAL_CARS } from "./src/constants";

async function seed() {
  try {
    const carsCol = collection(db, "cars");
    const snapshot = await getDocs(query(carsCol, limit(1)));
    
    if (snapshot.empty) {
      console.log("Seeding cars...");
      for (const car of INITIAL_CARS) {
        await addDoc(carsCol, car);
      }
      console.log("Seeding complete!");
    } else {
      console.log("Cars already exist, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding:", error);
  }
}

seed();
