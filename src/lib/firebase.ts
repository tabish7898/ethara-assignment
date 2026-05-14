import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer,
  memoryLocalCache,
} from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore to enable more robust connection settings
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  // Force long polling to bypass potential proxy/WebSocket issues in the preview environment
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Test Connection
async function testConnection() {
  try {
    // Try to fetch a doc from server to check connectivity
    await getDocFromServer(doc(db, "_test_connection_", "ping"));
    console.log("Firebase Connection: Direct server contact successful.");
  } catch (error: any) {
    if (error.code === "permission-denied") {
      console.log("Firebase Connection: Server reached, but access denied (Security rules are active).");
    } else if (error.code === "unavailable" || error.message?.includes("offline")) {
      console.error("Firebase Connection ERROR: Backend is not reachable. This often means the client is truly offline, or the Firebase project config is invalid, or the database is still initializing.");
    } else {
      console.error("Firebase Connection: Unexpected status code:", error.code, "-", error.message);
    }
  }
}
testConnection();
