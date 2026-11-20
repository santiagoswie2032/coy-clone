import { resetDb } from "../src/lib/db";

console.log("Seeding Coy database...");
resetDb();
console.log("Database reset and seeded successfully with 36 profiles and 10 incoming likes.");
