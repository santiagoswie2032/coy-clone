import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "coy.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables if they don't exist
  _db.exec(SCHEMA);

  // Auto-seed if profiles table is empty
  const count = _db.prepare("SELECT COUNT(*) as n FROM profiles").get() as { n: number };
  if (count.n === 0) {
    seedDatabase(_db);
  }

  return _db;
}

export function resetDb(): void {
  const db = getDb();
  const reset = db.transaction(() => {
    db.exec(`
      DELETE FROM matches;
      DELETE FROM swipes;
      DELETE FROM incoming_likes;
      DELETE FROM profiles;
    `);
    seedDatabase(db);
  });
  reset();
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  age           INTEGER NOT NULL,
  bio           TEXT NOT NULL,
  city          TEXT,
  college       TEXT,
  interests     TEXT NOT NULL,
  photo_url     TEXT NOT NULL,
  accent        TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS swipes (
  target_id   TEXT PRIMARY KEY REFERENCES profiles(id),
  direction   TEXT NOT NULL CHECK (direction IN ('like','pass')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS incoming_likes (
  profile_id  TEXT PRIMARY KEY REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS matches (
  profile_id  TEXT PRIMARY KEY REFERENCES profiles(id),
  matched_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

interface SeedProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  city: string | null;
  college: string | null;
  interests: string[];
  accent: "blue" | "peach" | "lavender" | "yellow" | "mint";
  display_order: number;
}

const SEED_PROFILES: SeedProfile[] = [
  { id: "p01", name: "Aarav", age: 22, bio: "Coffee snob who writes poetry at 3 AM. Currently debugging my life.", city: "Pune", college: "VIT", interests: ["Chai", "Poetry", "Football", "Open source"], accent: "peach", display_order: 1 },
  { id: "p02", name: "Meera", age: 20, bio: "Dancing through algorithms and deadlines since 2006.", city: "Bengaluru", college: "IISc", interests: ["Classical dance", "ML", "Stargazing"], accent: "lavender", display_order: 2 },
  { id: "p03", name: "Rohan", age: 23, bio: "Film nerd. Can quote Gangs of Wasseypur backwards.", city: "Mumbai", college: null, interests: ["Cinema", "Street food", "Guitar"], accent: "blue", display_order: 3 },
  { id: "p04", name: "Ananya", age: 21, bio: "Bookworm with a caffeine addiction. Currently reading Murakami.", city: null, college: "St. Stephen's", interests: ["Books", "Lo-fi", "Painting", "Chai"], accent: "yellow", display_order: 4 },
  { id: "p05", name: "Kabir", age: 24, bio: "Building startups and breaking things. Send memes, not resumes.", city: "Delhi", college: "IIT Delhi", interests: ["Startups", "Anime", "Basketball"], accent: "peach", display_order: 5 },
  { id: "p06", name: "Priya", age: 19, bio: "Plant mom. My pothos has more growth than my grades.", city: "Chennai", college: "VIT", interests: ["Plants", "Cooking", "K-drama", "Yoga"], accent: "mint", display_order: 6 },
  { id: "p07", name: "Arjun", age: 22, bio: "Night owl who runs on code and cold coffee.", city: "Hyderabad", college: "IIIT-H", interests: ["Competitive coding", "Anime", "Chess"], accent: "blue", display_order: 7 },
  { id: "p08", name: "Diya", age: 20, bio: "Collecting sunsets and concert tickets since 2004.", city: "Bengaluru", college: null, interests: ["Photography", "Live music", "Travel"], accent: "peach", display_order: 8 },
  { id: "p09", name: "Vikram", age: 25, bio: "Gym rat by morning, chai philosopher by night.", city: "Jaipur", college: null, interests: ["Fitness", "Chai", "Philosophy", "Cricket"], accent: "yellow", display_order: 9 },
  { id: "p10", name: "Isha", age: 21, bio: "Design student who colour-codes everything, including feelings.", city: null, college: "NID", interests: ["UI design", "Watercolour", "Lo-fi", "Cycling"], accent: "lavender", display_order: 10 },
  { id: "p11", name: "Aditya", age: 23, bio: "History nerd. Will argue about Mughal architecture for hours.", city: "Delhi", college: null, interests: ["History", "Debate", "Street photography"], accent: "peach", display_order: 11 },
  { id: "p12", name: "Rhea", age: 20, bio: "Law student by day, Spotify DJ by night.", city: "Mumbai", college: "GLC Mumbai", interests: ["Music", "Law", "Stand-up comedy", "Tennis"], accent: "blue", display_order: 12 },
  { id: "p13", name: "Siddharth", age: 22, bio: "Aspiring filmmaker. My hard drive is 90% footage.", city: "Pune", college: "FTII", interests: ["Filmmaking", "Screenwriting", "Cycling"], accent: "mint", display_order: 13 },
  { id: "p14", name: "Kavya", age: 19, bio: "Swipe right if you can explain quantum mechanics to me.", city: null, college: "BITS Pilani", interests: ["Physics", "Sci-fi", "Board games", "Chai"], accent: "yellow", display_order: 14 },
  { id: "p15", name: "Nikhil", age: 24, bio: "Chef-in-training. I'll judge you by your biryani opinions.", city: "Hyderabad", college: null, interests: ["Cooking", "Food blogging", "Cricket", "Rap"], accent: "peach", display_order: 15 },
  { id: "p16", name: "Tara", age: 21, bio: "Mountain person stuck in a metro city. Send trek plans.", city: "Bengaluru", college: "Christ University", interests: ["Trekking", "Journaling", "Coffee", "Dogs"], accent: "blue", display_order: 16 },
  { id: "p17", name: "Dev", age: 23, bio: "Full-stack dev who can't stack pancakes. Working on it.", city: "Raipur", college: "NIT Raipur", interests: ["Web dev", "Open source", "Gaming", "Chai"], accent: "lavender", display_order: 17 },
  { id: "p18", name: "Saanvi", age: 20, bio: "Economics major who still can't do her own taxes.", city: null, college: "LSR Delhi", interests: ["Economics", "Poetry", "Thrifting", "Yoga"], accent: "mint", display_order: 18 },
  { id: "p19", name: "Karan", age: 22, bio: "Basketball court > lecture hall. No, I won't explain.", city: "Mumbai", college: null, interests: ["Basketball", "Sneakers", "Hip-hop", "Photography"], accent: "yellow", display_order: 19 },
  { id: "p20", name: "Nisha", age: 21, bio: "Marine biology enthusiast. Yes, I talk to fish.", city: "Goa", college: null, interests: ["Marine biology", "Diving", "Sustainability", "Art"], accent: "blue", display_order: 20 },
  { id: "p21", name: "Harsh", age: 24, bio: "Startup grind + lo-fi beats = my entire personality.", city: "Delhi", college: "IIT Delhi", interests: ["Startups", "Lo-fi", "Running", "Coffee"], accent: "peach", display_order: 21 },
  { id: "p22", name: "Aisha", age: 19, bio: "Theatre kid energy. Will monologue at any opportunity.", city: null, college: "St. Xavier's", interests: ["Theatre", "Writing", "Chai", "Podcasts"], accent: "lavender", display_order: 22 },
  { id: "p23", name: "Pranav", age: 23, bio: "Data scientist who can't decide what to eat for lunch.", city: "Bengaluru", college: null, interests: ["Data science", "Football", "Anime", "Cooking"], accent: "mint", display_order: 23 },
  { id: "p24", name: "Riya", age: 20, bio: "Architecture student. Everything is a building to me.", city: "Chandigarh", college: null, interests: ["Architecture", "Sketching", "Cycling", "Jazz"], accent: "yellow", display_order: 24 },
  { id: "p25", name: "Veer", age: 22, bio: "Cricket by passion, engineering by compulsion.", city: "Lucknow", college: null, interests: ["Cricket", "Gaming", "Memes", "Street food"], accent: "blue", display_order: 25 },
  { id: "p26", name: "Simran", age: 21, bio: "Psychology major reading everyone's body language. Sorry.", city: null, college: "TISS Mumbai", interests: ["Psychology", "Journaling", "Yoga", "Documentaries"], accent: "peach", display_order: 26 },
  { id: "p27", name: "Arnav", age: 23, bio: "Music producer making beats nobody has heard yet.", city: "Mumbai", college: null, interests: ["Music production", "DJ", "Vinyl", "Skateboarding"], accent: "lavender", display_order: 27 },
  { id: "p28", name: "Zara", age: 20, bio: "Fashion design student. Will roast your outfit lovingly.", city: null, college: "NIFT Delhi", interests: ["Fashion", "Thrifting", "Street photography", "Coffee"], accent: "mint", display_order: 28 },
  { id: "p29", name: "Ishan", age: 24, bio: "PhD aspirant. My idea of fun is reading research papers.", city: "Kolkata", college: "ISI Kolkata", interests: ["Mathematics", "Chess", "Classical music", "Tea"], accent: "yellow", display_order: 29 },
  { id: "p30", name: "Myra", age: 19, bio: "Learning three languages at once. Currently confused in all.", city: "Pune", college: null, interests: ["Languages", "Travel", "Anime", "Baking"], accent: "blue", display_order: 30 },
  { id: "p31", name: "Reyansh", age: 22, bio: "Robotics nerd. My robot vacuum is my only stable relationship.", city: null, college: "IIT Madras", interests: ["Robotics", "AI", "Sci-fi", "Running"], accent: "peach", display_order: 31 },
  { id: "p32", name: "Avni", age: 21, bio: "Journalist-in-training. I'll interview you on the first date.", city: "Delhi", college: null, interests: ["Journalism", "Politics", "Coffee", "Stand-up comedy"], accent: "lavender", display_order: 32 },
  { id: "p33", name: "Sahil", age: 23, bio: "Surfer dude lost in an IT job. Waiting for the next wave.", city: "Mangalore", college: null, interests: ["Surfing", "Beach", "Guitar", "Travel"], accent: "mint", display_order: 33 },
  { id: "p34", name: "Pooja", age: 20, bio: "Astronomy nerd. Will drag you stargazing at midnight.", city: null, college: "IISER Pune", interests: ["Astronomy", "Stargazing", "Sci-fi", "Hiking"], accent: "yellow", display_order: 34 },
  { id: "p35", name: "Aman", age: 24, bio: "Stand-up comic with a CS degree. The jokes compile, mostly.", city: "Bengaluru", college: null, interests: ["Stand-up comedy", "Coding", "Memes", "Board games"], accent: "blue", display_order: 35 },
  { id: "p36", name: "Kiara", age: 21, bio: "Environmental science meets street art. Saving the world, one mural at a time.", city: "Jaipur", college: null, interests: ["Street art", "Sustainability", "Music", "Chai"], accent: "peach", display_order: 36 },
];

// Incoming likes: 10 profiles spread through display_order
// Positions ~2, 5, 9, 13, 17, 20, 24, 27, 31, 35
const INCOMING_LIKE_IDS = ["p02", "p05", "p09", "p13", "p17", "p20", "p24", "p27", "p31", "p35"];

function seedDatabase(db: Database.Database): void {
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, name, age, bio, city, college, interests, photo_url, accent, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertIncomingLike = db.prepare(`
    INSERT INTO incoming_likes (profile_id) VALUES (?)
  `);

  const seed = db.transaction(() => {
    for (const p of SEED_PROFILES) {
      const photoUrl = `https://picsum.photos/seed/${p.id}/600/800`;
      insertProfile.run(
        p.id, p.name, p.age, p.bio, p.city, p.college,
        JSON.stringify(p.interests), photoUrl, p.accent, p.display_order
      );
    }
    for (const id of INCOMING_LIKE_IDS) {
      insertIncomingLike.run(id);
    }
  });

  seed();
}

export { SEED_PROFILES, INCOMING_LIKE_IDS, SCHEMA, seedDatabase };
