import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Example users to seed
const users = [
  {
    uid: "PUT_USER_UID_HERE",
    email: "user1@example.com",
    displayName: "User One",
    role: "admin", // or "super_admin", "safety_manager", "employee"
    tenantId: "your-tenant-id",
    isActive: true,
    permissions: [
      "manage_users",
      "view_users",
      "create_users",
      "edit_users",
      "delete_users",
      "manage_incidents",
      "view_incidents",
      "create_incidents",
      "edit_incidents",
      "delete_incidents",
      "manage_documents",
      "view_documents",
      "create_documents",
      "edit_documents",
      "delete_documents",
      "view_reports",
      "create_reports",
      "edit_reports",
      "delete_reports",
      // ...add more as needed for the role
    ],
  },
  // Add more users as needed
];

async function seedUsers() {
  for (const user of users) {
    await db.collection("users").doc(user.uid).set(user, { merge: true });
    console.log(`Seeded user: ${user.email}`);
  }
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
