export interface JavaFile {
  name: string;
  code: string;
  description: string;
}

export const JAVA_PROJECT_FILES: JavaFile[] = [
  {
    name: "Book.java",
    description: "Represents the Book model with details such as ID, title, author, category, description, and running stats for rating count and average rating.",
    code: `package com.recsys;

/**
 * Model class representing a Book in the system.
 */
public class Book {
    private String id;
    private String title;
    private String author;
    private String category;
    private String description;
    private int ratingCount;
    private double averageRating;
    private int publishYear;
    private int pages;

    public Book(String id, String title, String author, String category, String description, int publishYear, int pages) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.description = description;
        this.publishYear = publishYear;
        this.pages = pages;
        this.ratingCount = 0;
        this.averageRating = 0.0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getRatingCount() { return ratingCount; }
    public void setRatingCount(int ratingCount) { this.ratingCount = ratingCount; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getPublishYear() { return publishYear; }
    public void setPublishYear(int publishYear) { this.publishYear = publishYear; }

    public int getPages() { return pages; }
    public void setPages(int pages) { this.pages = pages; }

    @Override
    public String toString() {
        return String.format("[%s] %s by %s | Category: %s | Avg Rating: %.2f (%d ratings)", 
                id, title, author, category, averageRating, ratingCount);
    }
}`
  },
  {
    name: "User.java",
    description: "Represents the User model containing user profile settings, credentials, language preference, and reading goals.",
    code: `package com.recsys;

/**
 * Model class representing a registered User in the system.
 */
public class User {
    private String username;
    private String email;
    private String preferredLanguage; // en, ta, hi, etc.
    private int challengeGoal;        // Target books to read
    private int challengeProgress;    // Books read so far

    public User(String username, String email, String preferredLanguage, int challengeGoal, int challengeProgress) {
        this.username = username;
        this.email = email;
        this.preferredLanguage = preferredLanguage;
        this.challengeGoal = challengeGoal;
        this.challengeProgress = challengeProgress;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public int getChallengeGoal() { return challengeGoal; }
    public void setChallengeGoal(int challengeGoal) { this.challengeGoal = challengeGoal; }

    public int getChallengeProgress() { return challengeProgress; }
    public void setChallengeProgress(int challengeProgress) { this.challengeProgress = challengeProgress; }

    @Override
    public String toString() {
        return String.format("User: %s (%s) | Goal: %d Books | Progress: %d Books", 
                username, email, challengeGoal, challengeProgress);
    }
}`
  },
  {
    name: "Rating.java",
    description: "Model representing a book rating (1 to 5 stars) given by a user, with optional review text.",
    code: `package com.recsys;

/**
 * Represents a single Rating action in the system.
 */
public class Rating {
    private String username;
    private String bookId;
    private int rating;
    private String review;

    public Rating(String username, String bookId, int rating, String review) {
        this.username = username;
        this.bookId = bookId;
        this.rating = rating;
        this.review = review;
    }

    public String getUsername() { return username; }
    public String getBookId() { return bookId; }
    public int getRating() { return rating; }
    public String getReview() { return review; }
}
`
  },
  {
    name: "CollaborativeFiltering.java",
    description: "Implements user-based Collaborative Filtering using Cosine Similarity. Contains matrix creation, similarity analysis, rating prediction, and confidence scoring.",
    code: `package com.recsys;

import java.util.*;

/**
 * Core Algorithm Implementation: User-Based Collaborative Filtering.
 * Calculates mathematical similarity between users and predicts rating matches.
 */
public class CollaborativeFiltering {

    /**
     * Calculates the Cosine Similarity between two rating vectors.
     * Formula: cos(A, B) = (A . B) / (||A|| * ||B||)
     */
    public static double calculateCosineSimilarity(Map<String, Integer> user1Ratings, Map<String, Integer> user2Ratings) {
        if (user1Ratings == null || user2Ratings == null || user1Ratings.isEmpty() || user2Ratings.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        // Calculate dot product and norm1
        for (Map.Entry<String, Integer> entry : user1Ratings.entrySet()) {
            String bookId = entry.getKey();
            int r1 = entry.getValue();
            norm1 += Math.pow(r1, 2);

            if (user2Ratings.containsKey(bookId)) {
                int r2 = user2Ratings.get(bookId);
                dotProduct += r1 * r2;
            }
        }

        // Calculate norm2
        for (int r2 : user2Ratings.values()) {
            norm2 += Math.pow(r2, 2);
        }

        if (norm1 == 0.0 || norm2 == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Generates personalized book recommendations for a target user.
     * Returns a list of Book IDs mapped to their Predicted Rating and Confidence Score.
     */
    public static List<RecommendationResult> getRecommendations(
            String targetUser,
            Map<String, Map<String, Integer>> userRatingsMatrix,
            List<Book> allBooks,
            int limit) {

        List<RecommendationResult> recommendations = new ArrayList<>();
        Map<String, Integer> targetUserRatings = userRatingsMatrix.getOrDefault(targetUser, new HashMap<>());

        if (allBooks == null || allBooks.isEmpty()) {
            return recommendations;
        }

        // 1. Calculate similarities between the target user and all other users
        Map<String, Double> userSimilarities = new HashMap<>();
        for (Map.Entry<String, Map<String, Integer>> entry : userRatingsMatrix.entrySet()) {
            String otherUser = entry.getKey();
            if (!otherUser.equals(targetUser)) {
                double similarity = calculateCosineSimilarity(targetUserRatings, entry.getValue());
                if (similarity > 0.0) {
                    userSimilarities.put(otherUser, similarity);
                }
            }
        }

        // 2. Predict ratings for books the target user hasn't rated yet
        for (Book book : allBooks) {
            String bookId = book.getId();
            
            // Skip if the user has already rated this book
            if (targetUserRatings.containsKey(bookId)) {
                continue;
            }

            double weightedRatingSum = 0.0;
            double similaritySum = 0.0;

            for (Map.Entry<String, Double> entry : userSimilarities.entrySet()) {
                String otherUser = entry.getKey();
                double similarity = entry.getValue();
                Map<String, Integer> otherUserRatings = userRatingsMatrix.get(otherUser);

                if (otherUserRatings.containsKey(bookId)) {
                    int rating = otherUserRatings.get(bookId);
                    weightedRatingSum += rating * similarity;
                    similaritySum += similarity;
                }
            }

            // If any similar users have rated the book, calculate predicted rating
            if (similaritySum > 0.0) {
                double predictedRating = weightedRatingSum / similaritySum;
                
                // Match confidence is derived from the average similarity of the contributing neighbors
                double confidence = (similaritySum / userSimilarities.size()) * 100;
                // Clamp confidence between 50% and 99% for visual presentation
                confidence = Math.max(50.0, Math.min(99.0, confidence + 40));

                recommendations.add(new RecommendationResult(book, predictedRating, confidence));
            }
        }

        // Sort recommendations by predicted rating descending
        recommendations.sort((a, b) -> Double.compare(b.getPredictedRating(), a.getPredictedRating()));

        if (recommendations.size() > limit) {
            return recommendations.subList(0, limit);
        }
        return recommendations;
    }

    /**
     * DTO to carry Recommendation Results
     */
    public static class RecommendationResult {
        private Book book;
        private double predictedRating;
        private double confidence;

        public RecommendationResult(Book book, double predictedRating, double confidence) {
            this.book = book;
            this.predictedRating = predictedRating;
            this.confidence = confidence;
        }

        public Book getBook() { return book; }
        public double getPredictedRating() { return predictedRating; }
        public double getConfidence() { return confidence; }
    }
}`
  },
  {
    name: "DatabaseHelper.java",
    description: "SQLite JDBC Database utility to initialize database schema and manage persistent state for users, books, ratings, history, and wishlists.",
    code: `package com.recsys;

import java.sql.*;
import java.util.*;

/**
 * Manages SQL database connection, table initialization, and storage operations.
 * Utilizes SQLite JDBC.
 */
public class DatabaseHelper {
    private static final String DB_URL = "jdbc:sqlite:recommendation_system.db";

    static {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            System.err.println("SQLite JDBC Driver not found. Add org.sqlite.JDBC to your classpath.");
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    /**
     * Initializes the DB schema and inserts starting seed data.
     */
    public static void initializeDatabase() {
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            
            // Create tables
            stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                    "username TEXT PRIMARY KEY, " +
                    "password TEXT NOT NULL, " +
                    "email TEXT NOT NULL, " +
                    "preferred_lang TEXT DEFAULT 'en', " +
                    "challenge_goal INTEGER DEFAULT 5, " +
                    "challenge_progress INTEGER DEFAULT 0)");

            stmt.execute("CREATE TABLE IF NOT EXISTS books (" +
                    "id TEXT PRIMARY KEY, " +
                    "title TEXT NOT NULL, " +
                    "author TEXT NOT NULL, " +
                    "category TEXT NOT NULL, " +
                    "description TEXT, " +
                    "publish_year INTEGER, " +
                    "pages INTEGER)");

            stmt.execute("CREATE TABLE IF NOT EXISTS ratings (" +
                    "username TEXT, " +
                    "book_id TEXT, " +
                    "rating INTEGER CHECK(rating BETWEEN 1 AND 5), " +
                    "review TEXT, " +
                    "PRIMARY KEY (username, book_id), " +
                    "FOREIGN KEY(username) REFERENCES users(username), " +
                    "FOREIGN KEY(book_id) REFERENCES books(id))");

            stmt.execute("CREATE TABLE IF NOT EXISTS wishlist (" +
                    "username TEXT, " +
                    "book_id TEXT, " +
                    "PRIMARY KEY (username, book_id))");

            stmt.execute("CREATE TABLE IF NOT EXISTS favorites (" +
                    "username TEXT, " +
                    "book_id TEXT, " +
                    "PRIMARY KEY (username, book_id))");

            // Seed initial books if table is empty
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM books");
            if (rs.next() && rs.getInt(1) == 0) {
                System.out.println("Seeding database with default catalog...");
                
                String insertBookSql = "INSERT INTO books (id, title, author, category, description, publish_year, pages) VALUES (?, ?, ?, ?, ?, ?, ?)";
                try (PreparedStatement pstmt = conn.prepareStatement(insertBookSql)) {
                    // Book 1
                    pstmt.setString(1, "prog_1");
                    pstmt.setString(2, "Effective Java");
                    pstmt.setString(3, "Joshua Bloch");
                    pstmt.setString(4, "Programming");
                    pstmt.setString(5, "The definitive guide to Java platform best practices.");
                    pstmt.setInt(6, 2018);
                    pstmt.setInt(7, 412);
                    pstmt.executeUpdate();

                    // Book 2
                    pstmt.setString(1, "prog_2");
                    pstmt.setString(2, "Introduction to Algorithms");
                    pstmt.setString(3, "Cormen, Leiserson, Rivest");
                    pstmt.setString(4, "Programming");
                    pstmt.setString(5, "The standard textbook for algorithm design.");
                    pstmt.setInt(6, 2009);
                    pstmt.setInt(7, 1292);
                    pstmt.executeUpdate();

                    // Book 3
                    pstmt.setString(1, "novel_1");
                    pstmt.setString(2, "The Great Gatsby");
                    pstmt.setString(3, "F. Scott Fitzgerald");
                    pstmt.setString(4, "Novel");
                    pstmt.setString(5, "The classic novel set in the Jazz Age on Long Island.");
                    pstmt.setInt(6, 1925);
                    pstmt.setInt(7, 180);
                    pstmt.executeUpdate();

                    // Book 4
                    pstmt.setString(1, "hist_1");
                    pstmt.setString(2, "Sapiens: A Brief History");
                    pstmt.setString(3, "Yuval Noah Harari");
                    pstmt.setString(4, "History");
                    pstmt.setString(5, "A sweeping narrative of human history from the Stone Age.");
                    pstmt.setInt(6, 2011);
                    pstmt.setInt(7, 443);
                    pstmt.executeUpdate();
                }

                // Seed ratings from mock users for CF recommendation testing
                String insertRatingSql = "INSERT INTO ratings (username, book_id, rating, review) VALUES (?, ?, ?, ?)";
                try (PreparedStatement rstmt = conn.prepareStatement(insertRatingSql)) {
                    // Admin ratings
                    rstmt.setString(1, "admin");
                    rstmt.setString(2, "prog_1");
                    rstmt.setInt(3, 5);
                    rstmt.setString(4, "Masterpiece!");
                    rstmt.executeUpdate();

                    rstmt.setString(1, "admin");
                    rstmt.setString(2, "prog_2");
                    rstmt.setInt(3, 4);
                    rstmt.setString(4, "Great math reference.");
                    rstmt.executeUpdate();

                    // Alice (similar taste as target users might have)
                    rstmt.setString(1, "Alice");
                    rstmt.setString(2, "prog_1");
                    rstmt.setInt(3, 5);
                    rstmt.setString(4, "A must-read!");
                    rstmt.executeUpdate();

                    rstmt.setString(1, "Alice");
                    rstmt.setString(2, "novel_1");
                    rstmt.setInt(3, 2);
                    rstmt.setString(4, "Not my type.");
                    rstmt.executeUpdate();

                    // Bob (likes novels)
                    rstmt.setString(1, "Bob");
                    rstmt.setString(2, "novel_1");
                    rstmt.setInt(3, 5);
                    rstmt.setString(4, "Beautifully written.");
                    rstmt.executeUpdate();
                }
                
                // Seed a couple users
                stmt.execute("INSERT OR IGNORE INTO users (username, password, email) VALUES ('admin', 'admin123', 'admin@recsys.com')");
                stmt.execute("INSERT OR IGNORE INTO users (username, password, email) VALUES ('Alice', 'pass123', 'alice@gmail.com')");
                stmt.execute("INSERT OR IGNORE INTO users (username, password, email) VALUES ('Bob', 'pass123', 'bob@gmail.com')");
            }

        } catch (SQLException e) {
            System.err.println("Error initializing SQLite database: " + e.getMessage());
        }
    }

    public static boolean registerUser(String username, String password, String email) {
        String sql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        try (Connection conn = getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            pstmt.setString(2, password);
            pstmt.setString(3, email);
            pstmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Register failed: " + e.getMessage());
            return false;
        }
    }

    public static boolean validateLogin(String username, String password) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        try (Connection conn = getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            pstmt.setString(2, password);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            return false;
        }
    }

    public static List<Book> getAllBooks() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT * FROM books";
        try (Connection conn = getConnection(); 
             Statement stmt = conn.createStatement(); 
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Book book = new Book(
                        rs.getString("id"),
                        rs.getString("title"),
                        rs.getString("author"),
                        rs.getString("category"),
                        rs.getString("description"),
                        rs.getInt("publish_year"),
                        rs.getInt("pages")
                );
                
                // Fetch aggregate ratings
                loadBookRatingAggregates(book, conn);
                books.add(book);
            }
        } catch (SQLException e) {
            System.err.println("Error loading books: " + e.getMessage());
        }
        return books;
    }

    private static void loadBookRatingAggregates(Book book, Connection conn) {
        String sql = "SELECT COUNT(*), AVG(rating) FROM ratings WHERE book_id = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, book.getId());
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                book.setRatingCount(rs.getInt(1));
                book.setAverageRating(rs.getDouble(2));
            }
        } catch (SQLException ignored) {}
    }

    public static Map<String, Map<String, Integer>> getRatingsMatrix() {
        Map<String, Map<String, Integer>> matrix = new HashMap<>();
        String sql = "SELECT username, book_id, rating FROM ratings";
        try (Connection conn = getConnection(); 
             Statement stmt = conn.createStatement(); 
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                String u = rs.getString("username");
                String b = rs.getString("book_id");
                int r = rs.getInt("rating");

                matrix.putIfAbsent(u, new HashMap<>());
                matrix.get(u).put(b, r);
            }
        } catch (SQLException ignored) {}
        return matrix;
    }

    public static boolean saveRating(String username, String bookId, int rating, String review) {
        String sql = "INSERT OR REPLACE INTO ratings (username, book_id, rating, review) VALUES (?, ?, ?, ?)";
        try (Connection conn = getConnection(); PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            pstmt.setString(2, bookId);
            pstmt.setInt(3, rating);
            pstmt.setString(4, review);
            pstmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            return false;
        }
    }
}`
  },
  {
    name: "Main.java",
    description: "Main console entry point. Boots the system, presents an elegant shell, allows live user ratings, calculates collaborative matches, and displays output metrics.",
    code: `package com.recsys;

import java.util.*;

/**
 * Driver console execution class for Book Recommendation System.
 */
public class Main {
    private static User currentUser = null;
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   INITIALIZING COLLABORATIVE RECOMMENDATION...   ");
        System.out.println("=================================================");
        
        // Initialize SQLite Database tables
        DatabaseHelper.initializeDatabase();

        boolean exit = false;
        while (!exit) {
            printHeader();
            if (currentUser == null) {
                exit = anonymousMenu();
            } else {
                exit = loggedInMenu();
            }
        }
        System.out.println("\\nThank you for using the Java Recommendation System! Keep Reading.");
    }

    private static void printHeader() {
        System.out.println("\\n-------------------------------------------------");
        System.out.println("  JAVA BOOK RECOMMENDATION SYSTEM - COLLABORATIVE");
        System.out.println("-------------------------------------------------");
        if (currentUser != null) {
            System.out.println(" Logged in: " + currentUser.getUsername() + " | Lang: " + currentUser.getPreferredLanguage());
        } else {
            System.out.println(" Status: Guest");
        }
        System.out.println("-------------------------------------------------");
    }

    private static boolean anonymousMenu() {
        System.out.println("1. Register Account");
        System.out.println("2. User Log In");
        System.out.println("3. Browse Complete Book Catalog");
        System.out.println("4. Exit");
        System.out.print("Enter selection (1-4): ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1:
                doRegister();
                break;
            case 2:
                doLogin();
                break;
            case 3:
                browseCatalog();
                break;
            case 4:
                return true;
            default:
                System.out.println("Invalid selection. Try again.");
        }
        return false;
    }

    private static boolean loggedInMenu() {
        System.out.println("1. Browse Complete Book Catalog");
        System.out.println("2. Submit Rating & Review");
        System.out.println("3. Get Personal Recommendations (Collaborative Filtering)");
        System.out.println("4. My Reading Challenge Stats");
        System.out.println("5. Simulator: View User-Item Similarity Matrix");
        System.out.println("6. Log Out");
        System.out.println("7. Exit");
        System.out.print("Enter selection (1-7): ");

        int choice = getIntInput();
        switch (choice) {
            case 1:
                browseCatalog();
                break;
            case 2:
                doRateBook();
                break;
            case 3:
                showPersonalRecommendations();
                break;
            case 4:
                showChallenge();
                break;
            case 5:
                simulateMatrix();
                break;
            case 6:
                currentUser = null;
                System.out.println("Logged out successfully.");
                break;
            case 7:
                return true;
            default:
                System.out.println("Invalid selection. Try again.");
        }
        return false;
    }

    private static int getIntInput() {
        try {
            return Integer.parseInt(scanner.nextLine().trim());
        } catch (Exception e) {
            return -1;
        }
    }

    private static void doRegister() {
        System.out.print("Enter new username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();
        System.out.print("Enter email: ");
        String email = scanner.nextLine().trim();

        if (DatabaseHelper.registerUser(user, pass, email)) {
            System.out.println("Registration successful! You can now log in.");
        } else {
            System.out.println("Registration failed. Username may already exist.");
        }
    }

    private static void doLogin() {
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();

        if (DatabaseHelper.validateLogin(user, pass)) {
            currentUser = new User(user, user + "@recsys.com", "en", 5, 2);
            System.out.println("Login successful. Welcome back, " + user + "!");
        } else {
            System.out.println("Invalid credentials. Try admin / admin123");
        }
    }

    private static void browseCatalog() {
        List<Book> books = DatabaseHelper.getAllBooks();
        System.out.println("\\n--- BOOK CATALOG ---");
        for (Book b : books) {
            System.out.println(b);
            System.out.println("   Description: " + b.getDescription());
        }
    }

    private static void doRateBook() {
        System.out.print("Enter Book ID to rate (e.g. prog_1, novel_1): ");
        String bookId = scanner.nextLine().trim();
        System.out.print("Enter Rating (1 to 5 stars): ");
        int rating = getIntInput();
        if (rating < 1 || rating > 5) {
            System.out.println("Invalid rating. Must be between 1 and 5.");
            return;
        }
        System.out.print("Enter written review: ");
        String review = scanner.nextLine().trim();

        if (DatabaseHelper.saveRating(currentUser.getUsername(), bookId, rating, review)) {
            System.out.println("Rating saved successfully!");
        } else {
            System.out.println("Failed to save rating. Verify Book ID.");
        }
    }

    private static void showPersonalRecommendations() {
        System.out.println("\\nCalculating recommendations using User-Based Collaborative Filtering...");
        List<Book> allBooks = DatabaseHelper.getAllBooks();
        Map<String, Map<String, Integer>> ratingsMatrix = DatabaseHelper.getRatingsMatrix();

        List<CollaborativeFiltering.RecommendationResult> recs = 
                CollaborativeFiltering.getRecommendations(currentUser.getUsername(), ratingsMatrix, allBooks, 3);

        if (recs.isEmpty()) {
            System.out.println("Not enough ratings in the database to find similar users yet!");
            System.out.println("Try rating 'prog_1' or 'novel_1' to seed your preference vector!");
        } else {
            System.out.println("\\n--- PERSONALIZED RECOMMENDATIONS FOR " + currentUser.getUsername().toUpperCase() + " ---");
            for (CollaborativeFiltering.RecommendationResult rec : recs) {
                System.out.printf("⭐ %-30s | Predicted Score: %.2f/5.0 | Match: %.1f%%\\n", 
                        rec.getBook().getTitle(), rec.getPredictedRating(), rec.getConfidence());
            }
        }
    }

    private static void showChallenge() {
        System.out.println("\\n--- MY READING CHALLENGE ---");
        System.out.println("Yearly Reading Goal: " + currentUser.getChallengeGoal() + " Books");
        System.out.println("Books Completed:     " + currentUser.getChallengeProgress() + " Books");
        double progressPct = ((double) currentUser.getChallengeProgress() / currentUser.getChallengeGoal()) * 100;
        System.out.printf("Challenge Status:    %.1f%% Completed\\n", progressPct);
    }

    private static void simulateMatrix() {
        System.out.println("\\n--- USER-ITEM RATING MATRIX SIMULATOR ---");
        Map<String, Map<String, Integer>> matrix = DatabaseHelper.getRatingsMatrix();
        List<Book> books = DatabaseHelper.getAllBooks();

        // Print header row
        System.out.printf("%-10s", "User");
        for (Book b : books) {
            System.out.printf(" | %-8s", b.getId());
        }
        System.out.println();

        // Print user rows
        for (Map.Entry<String, Map<String, Integer>> entry : matrix.entrySet()) {
            System.out.printf("%-10s", entry.getKey());
            Map<String, Integer> userRatings = entry.getValue();
            for (Book b : books) {
                Integer rating = userRatings.get(b.getId());
                System.out.printf(" | %-8s", (rating == null ? "-" : rating.toString() + "⭐"));
            }
            System.out.println();
        }
    }
}`
  },
  {
    name: "pom.xml",
    description: "Standard Maven configuration file specifying dependencies for SQLite JDBC and compiler versions so the project is buildable instantly in IDEs like Eclipse, NetBeans, or IntelliJ.",
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.recsys</groupId>
    <artifactId>book-recommendation-system</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- SQLite JDBC driver -->
        <dependency>
            <groupId>org.xerial</groupId>
            <artifactId>sqlite-jdbc</artifactId>
            <version>3.42.0.0</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
                <configuration>
                    <mainClass>com.recsys.Main</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    name: "README_VIVA_GUIDE.md",
    description: "Comprehensive guide summarizing the Collaborative Filtering mathematical algorithm, setup guidelines, and exact questions examiners ask during viva exams.",
    code: `# Project Guide & Viva Prep: Book Recommendation System

## 1. Algorithm Overview: Collaborative Filtering
Collaborative Filtering (CF) operates on the principle that if **User A** and **User B** agreed on an opinion in the past, they are likely to agree on other topics in the future.

### User-Based Collaborative Filtering Workflow:
1. **Represent Preferences**: Map users to high-dimensional rating vectors:
   $$U_i = [R_{i,1}, R_{i,2}, R_{i,3}, ..., R_{i,M}]$$ where empty slots are unrated books.
2. **Compute Similarity ($S_{u,v}$)**: Measure overlap using **Cosine Similarity**:
   $$\\text{Sim}(u,v) = \\frac{\\sum_{b \\in B} R_{u,b} \\cdot R_{v,b}}{\\sqrt{\\sum R_{u,b}^2} \\sqrt{\\sum R_{v,b}^2}}$$
3. **Neighbor Aggregation**: For a target book $b$ unrated by user $u$, predict rating:
   $$P_{u,b} = \\frac{\\sum_{v \\in N} \\text{Sim}(u,v) \\cdot R_{v,b}}{\\sum |\\text{Sim}(u,v)|}$$
4. **Confidence Threshold**: Express matching overlap as a percentile rating based on correlation confidence.

---

## 2. Compilation and Execution Rules
This project is packaged with **Apache Maven** and utilizes **SQLite** for zero-configuration, serverless, robust persistence.

### Prerequisites:
- Java JDK 17 or higher
- Apache Maven installed, OR run directly from any Java IDE (IntelliJ IDEA, Eclipse, NetBeans).

### Run from Command Line:
1. Navigate to the project root directory.
2. Compile and run using Maven:
   \`\`\`bash
   mvn clean compile exec:java
   \`\`\`
3. The program will automatically spin up a localized database file \`recommendation_system.db\` in the directory!

---

## 3. High-Probability Viva Questions & Master Answers

### Q1: What is Collaborative Filtering and how does it differ from Content-Based Filtering?
**Answer**: 
* **Collaborative Filtering** profiles users based on historical behaviors (ratings, clicks, views) rather than the inherent item properties. It recommends books rated highly by "similar peers" ($u \\rightarrow v$).
* **Content-Based Filtering** profiles items on features (genres, authors, descriptions) and recommends items that have similar parameters to books the user previously liked.

### Q2: Explain Cosine Similarity. Why are vectors used?
**Answer**: Cosine Similarity measures the angle between two multi-dimensional rating vectors. The magnitude of the vectors represents rating frequency, while the direction represents relative affinity. The cosine value ranges from \`0.0\` (orthogonal / no overlap) to \`1.0\` (identical preference alignment).

### Q3: What is the "Cold Start Problem" and how can we mitigate it in Java?
**Answer**: The Cold Start problem occurs when a **New User** has rated no books, or a **New Book** has received zero ratings, leaving the Collaborative Filtering engine unable to establish similarities.
* **Mitigation**: We solve this by (1) presenting trending/popular recommendations first, (2) prompting user for preferred categories/languages during signup, and (3) using AI hybrid suggestions (like our mood-based Gemini recommendation) until ratings accumulate.

### Q4: Why is SQLite used in this Java Project instead of standard lists/arrays?
**Answer**: Using simple lists or arrays stores data in RAM, meaning ratings and accounts wipe out the moment the app closes. SQLite provides persistent transactional SQL storage that fits in a lightweight single-file database. This models standard relational database schemas (User-Item-Rating relationships) matching enterprise patterns.
`
  }
];
