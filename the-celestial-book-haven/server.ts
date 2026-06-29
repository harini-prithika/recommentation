import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Book, Rating, User } from "./src/types";
import { INITIAL_BOOKS } from "./src/bookData";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully.");
  } catch (e) {
    console.error("Error initializing GoogleGenAI:", e);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined in the environment. AI features will run on local mock model fallback.");
}

// ==========================================
// IN-MEMORY SIMULATED RELATIONAL DB STATE
// ==========================================
let books: Book[] = [...INITIAL_BOOKS];

// Preseeded user list
let users: Record<string, User & { passwordHash: string }> = {
  harini: {
    id: "u_harini",
    username: "harini",
    email: "harini@gmail.com",
    passwordHash: "1234",
    favoriteBooks: ["novel_4", "sci_2", "hist_1"],
    wishlist: ["prog_3"],
    readingHistory: [
      { bookId: "novel_4", dateRead: "2026-06-18", progress: 100 },
      { bookId: "sci_2", dateRead: "2026-06-25", progress: 100 }
    ],
    challengeGoal: 12,
    challengeProgress: 2,
    preferredLanguage: "en"
  },
  admin: {
    id: "u_admin",
    username: "admin",
    email: "admin@recsys.com",
    passwordHash: "admin123",
    favoriteBooks: ["prog_1", "prog_3"],
    wishlist: ["prog_2"],
    readingHistory: [
      { bookId: "prog_1", dateRead: "2026-06-25", progress: 100, notes: "Excellent Java guide!" },
      { bookId: "prog_3", dateRead: "2026-06-28", progress: 60 }
    ],
    challengeGoal: 10,
    challengeProgress: 1,
    preferredLanguage: "en"
  },
  alice: {
    id: "u_alice",
    username: "Alice",
    email: "alice@gmail.com",
    passwordHash: "pass123",
    favoriteBooks: ["prog_1", "sci_1"],
    wishlist: ["hist_1"],
    readingHistory: [
      { bookId: "prog_1", dateRead: "2026-06-20", progress: 100 },
      { bookId: "sci_1", dateRead: "2026-06-27", progress: 100 }
    ],
    challengeGoal: 12,
    challengeProgress: 2,
    preferredLanguage: "en"
  },
  bob: {
    id: "u_bob",
    username: "Bob",
    email: "bob@gmail.com",
    passwordHash: "pass123",
    favoriteBooks: ["novel_1", "novel_2"],
    wishlist: ["novel_3"],
    readingHistory: [
      { bookId: "novel_1", dateRead: "2026-06-15", progress: 100 },
      { bookId: "novel_2", dateRead: "2026-06-22", progress: 100 }
    ],
    challengeGoal: 8,
    challengeProgress: 2,
    preferredLanguage: "ta"
  },
  priya: {
    id: "u_priya",
    username: "Priya",
    email: "priya@yahoo.com",
    passwordHash: "pass123",
    favoriteBooks: ["hist_1", "novel_4"],
    wishlist: ["hist_3"],
    readingHistory: [
      { bookId: "hist_1", dateRead: "2026-06-18", progress: 100 },
      { bookId: "novel_4", dateRead: "2026-06-24", progress: 100 }
    ],
    challengeGoal: 15,
    challengeProgress: 2,
    preferredLanguage: "hi"
  }
};

// Seeded ratings matrix
let ratings: Rating[] = [
  // Admin reviews
  { userId: "Alice", bookId: "prog_1", rating: 5, timestamp: "2026-06-20T10:00:00Z", review: "Essential read for any Java developer!" },
  { userId: "Alice", bookId: "prog_3", rating: 4, timestamp: "2026-06-21T11:00:00Z", review: "Great insights on writing tidy code." },
  { userId: "Alice", bookId: "sci_1", rating: 5, timestamp: "2026-06-27T09:00:00Z", review: "Stephen Hawking makes physics so accessible." },
  { userId: "Alice", bookId: "novel_1", rating: 2, timestamp: "2026-06-22T14:00:00Z", review: "A bit slow for my taste." },

  // Bob reviews
  { userId: "Bob", bookId: "novel_1", rating: 5, timestamp: "2026-06-15T08:00:00Z", review: "An American masterpiece!" },
  { userId: "Bob", bookId: "novel_2", rating: 5, timestamp: "2026-06-22T12:00:00Z", review: "Beautiful and heartbreaking." },
  { userId: "Bob", bookId: "novel_4", rating: 4, timestamp: "2026-06-23T15:00:00Z", review: "An inspiring fable." },
  { userId: "Bob", bookId: "prog_1", rating: 1, timestamp: "2026-06-24T18:00:00Z", review: "Too technical. Not interested." },

  // Priya reviews
  { userId: "Priya", bookId: "hist_1", rating: 5, timestamp: "2026-06-18T13:00:00Z", review: "Fascinating historical overview of humanity." },
  { userId: "Priya", bookId: "novel_4", rating: 5, timestamp: "2026-06-24T16:00:00Z", review: "Incredible search for personal legend!" },
  { userId: "Priya", bookId: "hist_3", rating: 4, timestamp: "2026-06-25T11:00:00Z", review: "Thorough biography. Well researched." },
  { userId: "Priya", bookId: "sci_1", rating: 2, timestamp: "2026-06-26T20:00:00Z", review: "A bit too complex." },

  // Admin reviews
  { userId: "admin", bookId: "prog_1", rating: 5, timestamp: "2026-06-25T10:00:00Z", review: "Bloch is a legend. Best book on Java!" },
  { userId: "admin", bookId: "prog_3", rating: 4, timestamp: "2026-06-28T09:00:00Z", review: "Important principles for software engineering." }
];

// Re-calculate average ratings for initial books
function updateBookRatingStats() {
  books.forEach(b => {
    const bookRatings = ratings.filter(r => r.bookId === b.id);
    b.ratingCount = bookRatings.length;
    if (bookRatings.length > 0) {
      const sum = bookRatings.reduce((acc, curr) => acc + curr.rating, 0);
      b.averageRating = Math.round((sum / bookRatings.length) * 10) / 10;
    } else {
      b.averageRating = 0;
    }
  });
}
updateBookRatingStats();

// ==========================================
// COLLABORATIVE FILTERING CORE TS FUNCTION
// ==========================================
function calculateCosineSimilarity(user1Ratings: Record<string, number>, user2Ratings: Record<string, number>): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const [bookId, r1] of Object.entries(user1Ratings)) {
    norm1 += r1 * r1;
    if (user2Ratings[bookId] !== undefined) {
      const r2 = user2Ratings[bookId];
      dotProduct += r1 * r2;
    }
  }

  for (const r2 of Object.values(user2Ratings)) {
    norm2 += r2 * r2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

function getCollaborativeRecommendations(targetUser: string, limit = 4) {
  // 1. Construct User-Item Rating Matrix
  const matrix: Record<string, Record<string, number>> = {};
  ratings.forEach(r => {
    const userKey = r.userId.toLowerCase();
    matrix[userKey] = matrix[userKey] || {};
    matrix[userKey][r.bookId] = r.rating;
  });

  const targetUserKey = targetUser.toLowerCase();
  const targetUserRatings = matrix[targetUserKey] || {};

  // 2. Compute similarities between target and all other users
  const similarities: Record<string, number> = {};
  Object.keys(matrix).forEach(otherUser => {
    if (otherUser !== targetUserKey) {
      const sim = calculateCosineSimilarity(targetUserRatings, matrix[otherUser]);
      if (sim > 0) {
        similarities[otherUser] = sim;
      }
    }
  });

  // 3. Predict scores for books not yet rated by the target user
  const predictions: { book: Book; predictedRating: number; confidence: number }[] = [];

  books.forEach(book => {
    // If user already rated this book, skip
    if (targetUserRatings[book.id] !== undefined) {
      return;
    }

    let weightedSum = 0;
    let similaritySum = 0;

    Object.entries(similarities).forEach(([otherUser, sim]) => {
      const otherUserRating = matrix[otherUser][book.id];
      if (otherUserRating !== undefined) {
        weightedSum += otherUserRating * sim;
        similaritySum += sim;
      }
    });

    if (similaritySum > 0) {
      const predicted = weightedSum / similaritySum;
      // Match confidence is mapped based on neighbor coverage and similarity
      const numNeighbors = Object.keys(similarities).length;
      let confidence = (similaritySum / (numNeighbors || 1)) * 100;
      // Clamp confidence reasonably
      confidence = Math.round(Math.max(50, Math.min(99, confidence + 45)));

      predictions.push({
        book,
        predictedRating: Math.round(predicted * 10) / 10,
        confidence
      });
    }
  });

  // Sort by predicted rating descending
  predictions.sort((a, b) => b.predictedRating - a.predictedRating);
  return predictions.slice(0, limit);
}

// ==========================================
// API ROUTES
// ==========================================

// Authentication & Profile Sim
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, preferredLanguage } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const userKey = username.toLowerCase();
  if (users[userKey]) {
    return res.status(400).json({ error: "Username is already taken" });
  }

  users[userKey] = {
    id: `u_${Date.now()}`,
    username,
    email,
    passwordHash: password,
    favoriteBooks: [],
    wishlist: [],
    readingHistory: [],
    challengeGoal: 5,
    challengeProgress: 0,
    preferredLanguage: preferredLanguage || "en"
  };

  res.json({ success: true, user: { username, email, preferredLanguage: users[userKey].preferredLanguage, isAdmin: username.toLowerCase() === "admin" || username.toLowerCase() === "harini" } });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const userKey = username.toLowerCase();
  const found = users[userKey];

  if (!found || found.passwordHash !== password) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  res.json({
    success: true,
    user: {
      username: found.username,
      email: found.email,
      preferredLanguage: found.preferredLanguage,
      isAdmin: found.username.toLowerCase() === "admin" || found.username.toLowerCase() === "harini"
    }
  });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address required" });
  }

  // Simulate sending standard 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  res.json({
    success: true,
    message: `A simulated 6-digit verification code OTP has been sent to ${email}`,
    otp // Send back to client so user can enter it and pass simulation
  });
});

app.get("/api/users/:username", (req, res) => {
  const userKey = req.params.username.toLowerCase();
  const u = users[userKey];
  if (!u) return res.status(404).json({ error: "User not found" });
  res.json({
    username: u.username,
    email: u.email,
    favoriteBooks: u.favoriteBooks,
    wishlist: u.wishlist,
    readingHistory: u.readingHistory,
    challengeGoal: u.challengeGoal,
    challengeProgress: u.challengeProgress,
    preferredLanguage: u.preferredLanguage
  });
});

app.post("/api/users/:username/profile", (req, res) => {
  const userKey = req.params.username.toLowerCase();
  const u = users[userKey];
  if (!u) return res.status(404).json({ error: "User not found" });

  const { preferredLanguage, challengeGoal, challengeProgress, email } = req.body;
  if (preferredLanguage) u.preferredLanguage = preferredLanguage;
  if (challengeGoal !== undefined) u.challengeGoal = Number(challengeGoal);
  if (challengeProgress !== undefined) u.challengeProgress = Number(challengeProgress);
  if (email) u.email = email;

  res.json({ success: true, user: u });
});

// Book Listings & Management (Admin Mode)
app.get("/api/books", (req, res) => {
  updateBookRatingStats();
  res.json(books);
});

app.post("/api/books", (req, res) => {
  const { title, author, category, description, publishYear, pages } = req.body;
  if (!title || !author || !category) {
    return res.status(400).json({ error: "Title, Author, and Category are required." });
  }

  const id = `${category.toLowerCase().slice(0, 4)}_${Date.now()}`;
  const colors = [
    "from-indigo-600 to-purple-800",
    "from-emerald-600 to-teal-800",
    "from-rose-600 to-red-800",
    "from-amber-600 to-orange-800",
    "from-slate-600 to-slate-800"
  ];
  const coverColor = colors[Math.floor(Math.random() * colors.length)];

  const newBook: Book = {
    id,
    title,
    author,
    category,
    description: description || "No description provided.",
    coverColor,
    ratingCount: 0,
    averageRating: 0,
    publishYear: Number(publishYear) || new Date().getFullYear(),
    pages: Number(pages) || 200,
    tags: [category, "Added"]
  };

  books.push(newBook);
  res.json({ success: true, book: newBook });
});

app.put("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) return res.status(404).json({ error: "Book not found" });

  const { title, author, category, description, publishYear, pages } = req.body;
  const original = books[bookIndex];

  books[bookIndex] = {
    ...original,
    title: title || original.title,
    author: author || original.author,
    category: category || original.category,
    description: description || original.description,
    publishYear: publishYear !== undefined ? Number(publishYear) : original.publishYear,
    pages: pages !== undefined ? Number(pages) : original.pages
  };

  res.json({ success: true, book: books[bookIndex] });
});

app.delete("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
  const idx = books.findIndex(b => b.id === bookId);
  if (idx === -1) return res.status(404).json({ error: "Book not found" });

  books.splice(idx, 1);
  // Remove ratings as well
  ratings = ratings.filter(r => r.bookId !== bookId);
  res.json({ success: true });
});

// Book Interaction Actions (Ratings, Wishlist, Favorites)
app.post("/api/ratings", (req, res) => {
  const { username, bookId, rating, review } = req.body;
  if (!username || !bookId || !rating) {
    return res.status(400).json({ error: "Username, book ID, and rating are required." });
  }

  const parsedRating = Number(rating);
  if (parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
  }

  // Upsert rating
  const existingIdx = ratings.findIndex(r => r.userId.toLowerCase() === username.toLowerCase() && r.bookId === bookId);
  const now = new Date().toISOString();

  if (existingIdx !== -1) {
    ratings[existingIdx] = {
      userId: ratings[existingIdx].userId, // keep casing
      bookId,
      rating: parsedRating,
      timestamp: now,
      review: review || ratings[existingIdx].review
    };
  } else {
    // Check if user is registered, else create default casing
    const casingUsername = users[username.toLowerCase()]?.username || username;
    ratings.push({
      userId: casingUsername,
      bookId,
      rating: parsedRating,
      timestamp: now,
      review: review || ""
    });
  }

  // Update book rating averages
  updateBookRatingStats();

  // Add to reading history if not already there
  const userKey = username.toLowerCase();
  const u = users[userKey];
  if (u) {
    const inHistory = u.readingHistory.some(h => h.bookId === bookId);
    if (!inHistory) {
      u.readingHistory.push({
        bookId,
        dateRead: now.slice(0, 10),
        progress: 100,
        notes: review
      });
      u.challengeProgress = u.readingHistory.length;
    }
  }

  res.json({ success: true, rating: { username, bookId, rating: parsedRating, review } });
});

app.get("/api/ratings", (req, res) => {
  res.json(ratings);
});

// User Actions: Wishlist and Favorites Toggle
app.post("/api/users/:username/wishlist", (req, res) => {
  const userKey = req.params.username.toLowerCase();
  const u = users[userKey];
  if (!u) return res.status(404).json({ error: "User not found" });

  const { bookId } = req.body;
  const idx = u.wishlist.indexOf(bookId);
  if (idx !== -1) {
    u.wishlist.splice(idx, 1); // remove
    res.json({ success: true, action: "removed", wishlist: u.wishlist });
  } else {
    u.wishlist.push(bookId); // add
    res.json({ success: true, action: "added", wishlist: u.wishlist });
  }
});

app.post("/api/users/:username/favorites", (req, res) => {
  const userKey = req.params.username.toLowerCase();
  const u = users[userKey];
  if (!u) return res.status(404).json({ error: "User not found" });

  const { bookId } = req.body;
  const idx = u.favoriteBooks.indexOf(bookId);
  if (idx !== -1) {
    u.favoriteBooks.splice(idx, 1); // remove
    res.json({ success: true, action: "removed", favorites: u.favoriteBooks });
  } else {
    u.favoriteBooks.push(bookId); // add
    res.json({ success: true, action: "added", favorites: u.favoriteBooks });
  }
});

// Recommendations Matrix Retrieval (For Simulator Visuals)
app.get("/api/matrix", (req, res) => {
  const matrix: Record<string, Record<string, number>> = {};
  ratings.forEach(r => {
    const uName = r.userId;
    matrix[uName] = matrix[uName] || {};
    matrix[uName][r.bookId] = r.rating;
  });

  // Calculate similarity matrix among all users
  const usernames = Object.keys(matrix);
  const similarityMatrix: Record<string, Record<string, number>> = {};

  usernames.forEach(u1 => {
    similarityMatrix[u1] = {};
    usernames.forEach(u2 => {
      if (u1 === u2) {
        similarityMatrix[u1][u2] = 1;
      } else {
        similarityMatrix[u1][u2] = Math.round(calculateCosineSimilarity(matrix[u1], matrix[u2]) * 100) / 100;
      }
    });
  });

  res.json({
    matrix,
    similarityMatrix,
    books: books.map(b => ({ id: b.id, title: b.title })),
    users: Object.keys(matrix)
  });
});

app.get("/api/recommendations/:username", (req, res) => {
  const recs = getCollaborativeRecommendations(req.params.username);
  res.json(recs);
});

// Gemini AI-Powered Mood Recommendation
app.post("/api/gemini/mood-recommend", async (req, res) => {
  const { mood, username } = req.body;
  if (!mood) {
    return res.status(400).json({ error: "Mood description is required." });
  }

  const bookSummary = books.map(b => `[ID: ${b.id}] "${b.title}" by ${b.author} (Category: ${b.category}) - ${b.description}`).join("\n");

  const prompt = `You are the core intelligence of our Book Recommendation System.
The user is describing their current mood, learning interest, or reading vibe:
"${mood}"

Here is our current inventory of books available in our database catalog:
${bookSummary}

Based on this user query, recommend exactly 2-3 books from our inventory.
For each book you recommend, you MUST provide:
1. The exact book ID (MUST match one of the IDs listed above like "prog_1" or "novel_2").
2. A match confidence percentage (from 60 to 99, e.g., 95).
3. A personalized, comforting, or motivational explanation detailing why this book fits their current mood.

Respond STRICTLY in a valid JSON array format, where each object has the keys: "bookId" (string), "matchScore" (number), and "reason" (string).
Example response:
[
  {"bookId": "prog_1", "matchScore": 95, "reason": "Since you want to level up your programming, Bloch's classic teaches professional Java design."}
]
Do not include any markdown backticks or extra text, output only the clean valid JSON array.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "[]";
      try {
        const parsed = JSON.parse(responseText.trim());
        
        // Map back to include full Book object
        const finalRecommendations = parsed.map((item: any) => {
          const b = books.find(book => book.id === item.bookId);
          return {
            book: b,
            matchScore: item.matchScore || 85,
            reason: item.reason || "This is a great match for your interests."
          };
        }).filter((item: any) => item.book !== undefined);

        return res.json(finalRecommendations);
      } catch (err) {
        console.error("Error parsing Gemini JSON:", err, responseText);
      }
    } catch (apiErr) {
      console.error("Gemini API call failed:", apiErr);
    }
  }

  // Fallback Rule-based logic if Gemini is unconfigured or fails
  console.log("Running fallback rule-based matching...");
  const searchMood = mood.toLowerCase();
  const matched: { book: Book; matchScore: number; reason: string }[] = [];

  // Simple heuristic checks
  let categoryFilter = "";
  if (searchMood.includes("code") || searchMood.includes("program") || searchMood.includes("java") || searchMood.includes("tech") || searchMood.includes("soft")) {
    categoryFilter = "programming";
  } else if (searchMood.includes("history") || searchMood.includes("past") || searchMood.includes("war") || searchMood.includes("biography") || searchMood.includes("politics")) {
    categoryFilter = "history";
  } else if (searchMood.includes("space") || searchMood.includes("physics") || searchMood.includes("star") || searchMood.includes("science")) {
    categoryFilter = "science";
  } else if (searchMood.includes("classic") || searchMood.includes("novel") || searchMood.includes("story") || searchMood.includes("fiction")) {
    categoryFilter = "novel";
  }

  const pool = categoryFilter 
    ? books.filter(b => b.category.toLowerCase() === categoryFilter)
    : books;

  // Pick 2 random or relevant books
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  shuffled.slice(0, 3).forEach((b, idx) => {
    let score = 90 - (idx * 5) + Math.floor(Math.random() * 5);
    matched.push({
      book: b,
      matchScore: score,
      reason: `Based on your interest in "${mood}", "${b.title}" is an ideal recommendation from our ${b.category} category. (API Fallback Match)`
    });
  });

  res.json(matched);
});

// Mock report PDF text exporter
app.post("/api/report/generate", (req, res) => {
  const { username } = req.body;
  const userKey = username.toLowerCase();
  const u = users[userKey];
  if (!u) return res.status(404).json({ error: "User not found" });

  const historyDetails = u.readingHistory.map(h => {
    const b = books.find(bk => bk.id === h.bookId);
    return `   - [${h.dateRead}] "${b?.title || h.bookId}" by ${b?.author || "Unknown"} (Progress: ${h.progress}%)`;
  }).join("\n");

  const textReport = `
============================================================
              OFFICIAL READING ANALYTICS REPORT
============================================================
   Generated on: ${new Date().toLocaleDateString()}
   User:         ${u.username}
   Email:        ${u.email}
------------------------------------------------------------
1. ANNUAL READING CHALLENGE STATUS:
   - Target Goal:      ${u.challengeGoal} books
   - Completed:        ${u.challengeProgress} books
   - Progress Rate:    ${Math.round((u.challengeProgress / u.challengeGoal) * 100)}%

2. COMPLETED BOOKS & HISTORY:
${historyDetails || "   No completed reading logs found."}

3. WISHLIST DIRECTORY:
${u.wishlist.map(w => `   - "${books.find(bk => bk.id === w)?.title || w}"`).join("\n") || "   Wishlist is currently empty."}

4. SYSTEM COLLABORATIVE RECOMMENDATION COVERAGE:
   Our User-Item algorithm matches your historical profile against similar peers 
   to provide a continuous cycle of fresh suggestions.
============================================================
`;
  res.setHeader("Content-Disposition", "attachment; filename=reading_report.txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(textReport);
});

// ==========================================
// STATIC ASSETS AND SERVER BOOT
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Recommendation server is booting at http://0.0.0.0:${PORT}`);
  });
}

startServer();
