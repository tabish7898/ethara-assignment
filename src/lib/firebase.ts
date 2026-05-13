import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore to enable more robust connection settings
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true, // This can help in certain proxy/iframe environments
}, firebaseConfig.firestoreDatabaseId);

// Test Connection
async function testConnection() {
  try {
    // Try to fetch a doc from server to check connectivity
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    // Permission denied is GOOD - it means we reached the server and rules blocked us
    if (error.code === "permission-denied") {
      console.log("Firebase Connection: Verified (Security Rules Active)");
    } else if (error.code === "unavailable") {
      console.warn("Firebase Connection: Backend unavailable or initializing.");
    } else {
      console.error("Firebase Connection: Unexpected error", error.code);
    }
  }
}
testConnection();
