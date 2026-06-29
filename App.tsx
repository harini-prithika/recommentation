import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Book, ActiveUser, LanguageCode, TRANSLATIONS, BookSuggestion } from "./types";
import VirtualBookshelf from "./components/VirtualBookshelf";
import SimilarityMatrix from "./components/SimilarityMatrix";
import AdminPanel from "./components/AdminPanel";
import BookDetailsModal from "./components/BookDetailsModal";
import {
  Search,
  BookOpen,
  FolderHeart,
  Grid,
  FileCode,
  Sliders,
  Sparkles,
  Award,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  LogOut,
  UserCheck,
  FileDown,
  Upload,
  RefreshCw,
  Bell,
  Check,
  TrendingUp,
  KeyRound,
  AlertCircle,
  X,
  Star,
  Info,
  SlidersHorizontal,
  Lock,
  Compass,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Theme state: default and forced to deep dark black for user specification
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [preferredLang, setPreferredLang] = useState<LanguageCode>("en");
  const t = TRANSLATIONS[preferredLang];

  // App core state
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [personalRecs, setPersonalRecs] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // AI & Mood Recommendations
  const [moodInput, setMoodInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<BookSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Active User session default to null so login portal shows up first
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  // User Profile full statistics
  const [userProfile, setUserProfile] = useState<any>(null);

  // Auth & recovery states for first page
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const [notifications, setNotifications] = useState<string[]>([
    "System Alert: Welcome to Celestial Book Haven! Explore books or use our mood-based recommender.",
    "Database Alert: New celestial fiction '1984' has been newly cataloged in the repository."
  ]);

  // Tab views
  const [activeTab, setActiveTab] = useState<"dashboard" | "shelf" | "matrix" | "admin">("dashboard");

  // Profile upload simulation
  const [uploading, setUploading] = useState(false);
  const [uploadedPic, setUploadedPic] = useState<string | null>(null);

  // Floating background books state for 1st page
  const [floatingBooks] = useState(() => [
    { id: 1, title: "The Alchemist", cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80", x: "8%", y: "12%", duration: 24, delay: 0 },
    { id: 2, title: "Clean Code", cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=150&q=80", x: "82%", y: "15%", duration: 28, delay: -4 },
    { id: 3, title: "Sapiens", cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=150&q=80", x: "42%", y: "78%", duration: 22, delay: -8 },
    { id: 4, title: "Cosmos", cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=150&q=80", x: "84%", y: "68%", duration: 32, delay: -12 },
    { id: 5, title: "1984", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=150&q=80", x: "12%", y: "72%", duration: 26, delay: -2 },
    { id: 6, title: "Effective Java", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80", x: "48%", y: "18%", duration: 30, delay: -14 },
    { id: 7, title: "Algorithms", cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=150&q=80", x: "6%", y: "42%", duration: 25, delay: -6 },
    { id: 8, title: "Brief History of Time", cover: "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=150&q=80", x: "78%", y: "42%", duration: 23, delay: -10 }
  ]);

  // Load books from database
  const loadBooks = async () => {
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        setFilteredBooks(data);
      }
    } catch (err) {
      console.error("Failed to load catalog books:", err);
    }
  };

  // Load recommendations
  const loadRecommendations = async () => {
    if (!activeUser) {
      setPersonalRecs([]);
      return;
    }
    try {
      const res = await fetch(`/api/recommendations/${activeUser.username}`);
      if (res.ok) {
        const recs = await res.json();
        setPersonalRecs(recs);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    }
  };

  // Load full User profile
  const loadUserProfile = async () => {
    if (!activeUser) {
      setUserProfile(null);
      return;
    }
    try {
      const res = await fetch(`/api/users/${activeUser.username}`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
        if (data.preferredLanguage) {
          setPreferredLang(data.preferredLanguage as LanguageCode);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (activeUser) {
      loadRecommendations();
      loadUserProfile();
    }
  }, [activeUser]);

  // Handle Search & Filter synchronization
  useEffect(() => {
    let result = books;
    if (selectedCategory !== "All") {
      result = result.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, books]);

  // Submit Mood-Based Suggestion Request
  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodInput.trim()) return;
    try {
      setAiLoading(true);
      const res = await fetch("/api/gemini/mood-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: moodInput,
          username: activeUser?.username || "Guest"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data);
      }
    } catch (err) {
      console.error("Mood suggestion error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Master login validation
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    const userLower = authForm.username.toLowerCase().trim();
    const pinStr = authForm.password.trim();

    // Custom check: username harini and PIN/password 1234
    if (userLower === "harini" && pinStr === "1234") {
      const activeUserObj = {
        id: "u_harini",
        username: "harini",
        email: "harini@gmail.com",
        isAdmin: true,
        preferredLanguage: "en"
      };
      setActiveUser(activeUserObj);
      setNotifications(prev => ["Welcome Harini! Admin & Personal credentials successfully synchronized.", ...prev]);
      setAuthForm({ username: "", email: "", password: "" });
      return;
    }

    // Backend query fallback
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authForm.username,
          password: authForm.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Access Denied. Username or master PIN invalid.");
        return;
      }
      if (data.success) {
        setActiveUser(data.user);
        setNotifications(prev => [`Access granted: Session open as ${data.user.username}.`, ...prev]);
        setAuthForm({ username: "", email: "", password: "" });
      }
    } catch (err) {
      setAuthError("Server verification offline. Check fallback.");
    }
  };

  // Forgot PIN handling
  const handleForgotPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySuccess(true);
    // Simulate alert log in console and modal
    setNotifications(prev => [`System recovery: Simulated PIN recovery signals sent to ${recoveryEmail}.`, ...prev]);
  };

  // Handle dynamic goal modifications
  const handleGoalChange = async (newGoal: number) => {
    if (!activeUser || newGoal < 1) return;
    try {
      const res = await fetch(`/api/users/${activeUser.username}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeGoal: newGoal })
      });
      if (res.ok) {
        loadUserProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated profile avatar upload
  const handleUploadPic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploadedPic(URL.createObjectURL(file));
      setUploading(false);
      setNotifications(prev => ["Profile photo updated successfully.", ...prev]);
    }, 1200);
  };

  // PDF Download reading report utilizing jsPDF
  const downloadReport = async () => {
    if (!activeUser) return;
    try {
      const doc = new jsPDF();
      doc.setFillColor(10, 10, 12);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFont("serif", "bold");
      doc.setFontSize(26);
      doc.setTextColor(245, 158, 11); // Gold
      doc.text("CELESTIAL BOOK HAVEN", 15, 25);

      doc.setFont("sans-serif", "bold");
      doc.setFontSize(11);
      doc.setTextColor(56, 189, 248); // Light Blue
      doc.text("PERSONAL READERSHIP & RECOMMENDATION ANALYTICS REPORT", 15, 33);

      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.5);
      doc.line(15, 36, 195, 36);

      doc.setFont("monospace", "normal");
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      doc.text(`SESSION PROFILE USER: ${activeUser.username.toUpperCase()}`, 15, 46);
      doc.text(`DATE GENERATED: ${new Date().toISOString().slice(0, 10)}`, 15, 52);
      doc.text(`RECOMMENDER ENGINE STATUS: ACTIVE`, 15, 58);

      doc.setFont("serif", "bold");
      doc.setFontSize(14);
      doc.setTextColor(245, 158, 11);
      doc.text("1. Reading Progress Vectors", 15, 70);

      let currentY = 80;
      if (userProfile) {
        doc.setFont("sans-serif", "normal");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(`Challenge Completion Ratio: ${userProfile.challengeProgress} of ${userProfile.challengeGoal} books`, 15, currentY);
        doc.text(`Percentage Completed: ${Math.round((userProfile.challengeProgress / userProfile.challengeGoal) * 100)}%`, 15, currentY + 6);
        currentY += 16;
      }

      doc.setFont("serif", "bold");
      doc.setFontSize(14);
      doc.setTextColor(245, 158, 11);
      doc.text("2. Live Collaborative Filtering Recommendations", 15, currentY);
      currentY += 10;

      if (personalRecs.length > 0) {
        personalRecs.forEach((item, index) => {
          doc.setFont("sans-serif", "bold");
          doc.setFontSize(10);
          doc.setTextColor(56, 189, 248);
          doc.text(`${index + 1}. ${item.book.title} (by ${item.book.author})`, 15, currentY);
          
          doc.setFont("sans-serif", "normal");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text(`- Predicted rating: ${item.predictedRating}/5.0   Confidence score: ${item.confidence}%`, 15, currentY + 5);
          currentY += 12;
        });
      } else {
        doc.setFont("sans-serif", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No rating vectors saved yet. Please rate bookshelf materials.", 15, currentY);
        currentY += 10;
      }

      doc.setDrawColor(245, 158, 11);
      doc.line(15, currentY + 5, 195, currentY + 5);

      doc.setFont("sans-serif", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 113, 108);
      doc.text("This PDF reports verification vectors from your active session profile. This data synchronizes directly with our relational DB state,", 15, currentY + 12);
      doc.text("matching you to peers using Cosine Similarity coefficient analysis.", 15, currentY + 16);
      
      doc.save(`${activeUser.username}_reading_report.pdf`);
    } catch (pdfErr) {
      console.error("Failed to generate PDF:", pdfErr);
    }
  };

  const handleLanguageSwitch = async (lang: LanguageCode) => {
    setPreferredLang(lang);
    if (activeUser) {
      try {
        await fetch(`/api/users/${activeUser.username}/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredLanguage: lang })
        });
      } catch (e) {}
    }
  };

  // Daily book suggestion calculation (deterministically using day of month)
  const getDailySuggestion = () => {
    if (books.length === 0) return null;
    const day = new Date().getDate();
    return books[day % books.length];
  };
  const dailySuggestion = getDailySuggestion();

  return (
    <div className="min-h-screen flex flex-col bg-black text-sky-300 font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* 1st Page: Animated Flying Books Portal (Login Gate) */}
      {!activeUser && (
        <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden p-4">
          
          {/* Animated Background Flying Books (translucent, blurred, non-disturbing) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            {floatingBooks.map((fBook) => (
              <motion.div
                key={fBook.id}
                animate={{
                  y: ["0px", "-130px", "0px"],
                  x: ["0px", "45px", "0px"],
                  rotate: [0, 8, -8, 0],
                }}
                transition={{
                  duration: fBook.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: fBook.delay,
                }}
                style={{ left: fBook.x, top: fBook.y }}
                className="absolute opacity-[0.2] sm:opacity-[0.25] blur-[0.3px] pointer-events-none"
              >
                <div className="relative w-16 sm:w-24 h-24 sm:h-36 bg-neutral-950 border border-sky-500/25 rounded-md shadow-[0_10px_35px_rgba(14,165,233,0.12)] overflow-hidden">
                  <img 
                    src={fBook.cover} 
                    alt={fBook.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
              </motion.div>
            ))}
            
            {/* Subtle light blue glowing particles */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:32px_32px]" />
          </div>

          {/* Central Glassmorphic Portal Form (Login & Forgot PIN Box) */}
          <div className="relative z-10 w-full max-w-md bg-neutral-950/90 border border-sky-950 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(14,165,233,0.15),0_0_20px_rgba(245,158,11,0.08)] backdrop-blur-xl text-center space-y-6">
            
            {/* Box Header - Animated floating vector ornament */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h2 className="font-serif font-black text-2xl tracking-tight bg-gradient-to-r from-amber-400 via-sky-300 to-amber-500 bg-clip-text text-transparent">
                The Celestial Book Haven
              </h2>
              <p className="text-xs text-sky-300 font-mono tracking-wide">
                Interactive Cosmic Recommendations & Shelf
              </p>
            </motion.div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Forget PIN Popup inside First Page */}
            {showForgotPin ? (
              <form onSubmit={handleForgotPinSubmit} className="space-y-4 text-left">
                <p className="text-xs text-sky-300 font-sans leading-relaxed">
                  Enter your registered email to dispatch simulated recovery signals.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">Registered Email Address</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    placeholder="e.g. harini@gmail.com"
                    className="w-full bg-black border border-sky-950 p-3 rounded-xl text-xs text-sky-300 focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                {recoverySuccess && (
                  <div className="p-3 bg-sky-950/40 border border-sky-500/30 text-sky-300 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-amber-400 font-mono">🔑 PIN Dispatched to Console!</p>
                    <p>For credentials 'harini', the master pin is: <strong className="text-amber-400">1234</strong></p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    Retrieve Access PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPin(false); setRecoverySuccess(false); }}
                    className="w-full py-2 border border-sky-950 hover:bg-sky-950/30 text-sky-300 font-mono text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Back to Portal Gate
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">Cosmic Username</label>
                  <input
                    type="text"
                    value={authForm.username}
                    onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                    placeholder="Enter username (e.g. harini)"
                    className="w-full bg-black border border-sky-950 p-3 rounded-xl text-xs text-sky-300 focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">Secret Access PIN</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPin(true)}
                      className="text-[10px] text-sky-400 font-mono hover:underline hover:text-amber-400 cursor-pointer"
                    >
                      Forget PIN?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="Enter 4-digit PIN (e.g. 1234)"
                    className="w-full bg-black border border-sky-950 p-3 rounded-xl text-xs text-sky-300 focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer mt-2"
                >
                  Unlock Portal Access &rarr;
                </button>
                
                <div className="text-center pt-2">
                  <p className="text-[10px] text-sky-400/60 font-mono">
                    Hint: username <span className="text-amber-400">harini</span>, pin/password <span className="text-amber-400">1234</span>
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Main logged in pages container */}
      {activeUser && (
        <>
          {/* GLOBAL HEADER BAR */}
          <header className="sticky top-0 z-40 bg-black/90 border-b border-sky-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-[0_4px_20px_rgba(14,165,233,0.05)]">
            
            {/* Title branding (no Java reference!) */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-700 text-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-400 via-sky-300 to-amber-500 bg-clip-text text-transparent">
                  The Celestial Book Haven
                </h1>
                <p className="text-[10px] sm:text-xs font-mono text-sky-400">
                  Interactive Collaborative Filtering & AI Search Portal
                </p>
              </div>
            </div>

            {/* Action controls */}
            <div className="flex items-center gap-3">
              
              {/* Multi Language switcher */}
              <div className="relative flex items-center gap-1 bg-black p-1.5 rounded-xl border border-sky-950">
                <Globe className="w-4 h-4 text-sky-400 ml-1.5" />
                <select
                  value={preferredLang}
                  onChange={(e) => handleLanguageSwitch(e.target.value as LanguageCode)}
                  className="bg-transparent text-xs font-mono text-sky-300 focus:outline-none pr-4 cursor-pointer"
                >
                  <option value="en" className="bg-black text-sky-300">English</option>
                  <option value="ta" className="bg-black text-sky-300">தமிழ்</option>
                  <option value="hi" className="bg-black text-sky-300">हिंदी</option>
                  <option value="te" className="bg-black text-sky-300">తెలుగు</option>
                </select>
              </div>

              {/* Session details */}
              <div className="flex items-center gap-3 pl-3 border-l border-sky-950">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-amber-400">{activeUser.username}</span>
                  <span className="text-[9px] font-mono text-sky-400">
                    {activeUser.isAdmin ? "Database Admin" : "Student Profile"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveUser(null);
                    setAiSuggestions([]);
                  }}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer"
                  title="Sign out of Celestial Portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          {/* CORE NAVIGATION RAIL */}
          <nav className="bg-neutral-950 px-6 py-2 border-b border-sky-950/40 flex gap-2 overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "bg-transparent border-transparent text-sky-300 hover:bg-sky-500/10"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Console Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("shelf")}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "shelf"
                  ? "bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "bg-transparent border-transparent text-sky-300 hover:bg-sky-500/10"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Virtual Bookshelf</span>
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border cursor-pointer ${
                activeTab === "matrix"
                  ? "bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "bg-transparent border-transparent text-sky-300 hover:bg-sky-500/10"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>CF Similarity Matrix</span>
            </button>
            {activeUser?.isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-amber-500/10 border-amber-500/35 text-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                    : "bg-transparent border-transparent text-sky-300 hover:bg-sky-500/10"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Admin Control Room</span>
              </button>
            )}
          </nav>

          {/* MAIN LAYOUT CANVAS */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8 bg-black">
            
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                
                {/* HERO STATS GRID - all movements and images included */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Daily Book Suggestion */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-neutral-950 p-5 rounded-2xl border border-sky-950 shadow-[0_0_20px_rgba(14,165,233,0.05)] flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                        <Sparkles className="w-4 h-4" />
                        <span>Daily Suggestion</span>
                      </div>
                      {dailySuggestion ? (
                        <div className="flex gap-4">
                          {dailySuggestion.coverImage && (
                            <div className="w-12 h-16 rounded overflow-hidden shadow-md shrink-0 border border-sky-500/20">
                              <img src={dailySuggestion.coverImage} alt={dailySuggestion.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h4 className="font-serif font-bold text-sm text-amber-400 leading-tight truncate">
                              {dailySuggestion.title}
                            </h4>
                            <p className="text-[10px] text-sky-400 font-medium">by {dailySuggestion.author}</p>
                            <p className="text-[11px] text-sky-300 mt-1 line-clamp-2 leading-relaxed">
                              {dailySuggestion.description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-sky-500 italic">No suggestions calculated.</p>
                      )}
                    </div>
                    {dailySuggestion && (
                      <button
                        onClick={() => setSelectedBook(dailySuggestion)}
                        className="mt-4 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 text-xs font-mono border border-amber-500/20 rounded-xl transition-all cursor-pointer self-start"
                      >
                        Examine Book Details
                      </button>
                    )}
                  </motion.div>

                  {/* Reading Challenge Progress Tracker */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-neutral-950 p-5 rounded-2xl border border-sky-950 shadow-[0_0_20px_rgba(14,165,233,0.05)] flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                          <Award className="w-4 h-4" />
                          <span>Reading Challenge Goal</span>
                        </div>
                        {userProfile && (
                          <button
                            onClick={downloadReport}
                            className="p-1 hover:bg-sky-950 text-sky-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                            title="Download reading report PDF structure"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {userProfile ? (
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-full border-4 border-sky-950 border-t-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                            <span className="text-xs font-mono font-bold text-amber-400">
                              {Math.round((userProfile.challengeProgress / userProfile.challengeGoal) * 100)}%
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-sky-300">
                              Completed: <strong className="text-amber-400">{userProfile.challengeProgress}</strong> / {userProfile.challengeGoal} books
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleGoalChange(userProfile.challengeGoal + 1)}
                                className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 text-[10px] font-mono text-sky-300 rounded border border-sky-900 cursor-pointer transition-all"
                              >
                                + Raise Goal
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-sky-500 italic">Reading goal vectors active.</p>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-sky-500 mt-3 border-t border-sky-950/40 pt-2 flex justify-between items-center">
                      <span>Interactive Report Output:</span>
                      {userProfile && <span onClick={downloadReport} className="text-amber-400 cursor-pointer hover:underline">Get PDF</span>}
                    </div>
                  </motion.div>

                  {/* User Profile */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-neutral-950 p-5 rounded-2xl border border-sky-950 shadow-[0_0_20px_rgba(14,165,233,0.05)] flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                        <UserCheck className="w-4 h-4" />
                        <span>Portal Session</span>
                      </div>
                      
                      {activeUser && (
                        <div className="flex items-center gap-4">
                          <div className="relative group w-14 h-14 rounded-full bg-neutral-900 overflow-hidden border border-sky-950 shadow-[0_0_10px_rgba(14,165,233,0.15)]">
                            {uploading ? (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                              </div>
                            ) : uploadedPic ? (
                              <img src={uploadedPic} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-sky-300 font-mono bg-sky-950/10">
                                Harini
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200">
                              <Upload className="w-4 h-4 text-amber-400" />
                              <input type="file" onChange={handleUploadPic} className="hidden" accept="image/*" />
                            </label>
                          </div>

                          <div className="space-y-0.5">
                            <h5 className="text-sm font-bold text-amber-400">{activeUser.username}</h5>
                            <p className="text-[10px] text-sky-400 font-mono">{activeUser.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-sky-500 mt-3 border-t border-sky-950/40 pt-2 flex justify-between items-center">
                      <span>Preference Set:</span>
                      <span className="uppercase text-amber-400 font-bold">{preferredLang}</span>
                    </div>
                  </motion.div>

                </div>

                {/* DUAL CORE SECTION: CATALOG SEARCH & RECS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Smart Book Finder Catalog */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Search control and category chips */}
                    <div className="bg-neutral-950 p-5 rounded-2xl border border-sky-950 shadow-md space-y-4">
                      
                      {/* Search input field */}
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                        <input
                          type="text"
                          placeholder={t.searchPlaceholder}
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-black border border-sky-950 pl-10 pr-4 py-3 rounded-xl text-xs text-sky-300 focus:outline-none focus:border-amber-400 placeholder-sky-900 transition-all"
                        />
                      </div>

                      {/* Category Chips scroll */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
                        {["All", "Novel", "Programming", "History", "Science"].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] border shrink-0 transition-all cursor-pointer ${
                              selectedCategory === cat
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                                : "bg-neutral-950 border-sky-950/60 text-sky-300 hover:bg-sky-500/10 hover:text-sky-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                    </div>

                    {/* Grid lists of matched items (Images in all boxes, scale movements) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredBooks.map(book => (
                        <motion.div
                          key={book.id}
                          onClick={() => setSelectedBook(book)}
                          whileHover={{ 
                            scale: 1.03, 
                            y: -4,
                            boxShadow: "0 10px 20px rgba(14,165,233,0.15), 0 0 10px rgba(245,158,11,0.08)"
                          }}
                          className="group bg-neutral-950 p-4 rounded-xl border border-sky-950 cursor-pointer flex gap-4 transition-all"
                        >
                          {/* Book image box with hover zoom movement */}
                          <div className="relative w-16 h-24 bg-black border border-amber-500/25 rounded-md overflow-hidden shrink-0 shadow-md">
                            {book.coverImage && (
                              <img 
                                src={book.coverImage} 
                                alt={book.title} 
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-300 pointer-events-none"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
                            <span className="absolute bottom-1 right-1.5 z-20 text-[7px] text-amber-400 font-mono font-bold">{book.averageRating || "N/A"} ⭐</span>
                          </div>

                          {/* Content column */}
                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-amber-400 truncate group-hover:text-amber-300 transition-colors">
                                {book.title}
                              </h4>
                              <p className="text-[10px] text-sky-300/80 font-medium truncate">by {book.author}</p>
                              <p className="text-[11px] text-sky-300 mt-1.5 line-clamp-2 leading-relaxed">
                                {book.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              {book.tags.slice(0, 2).map(tg => (
                                <span key={tg} className="px-2 py-0.5 bg-sky-950/40 text-[9px] font-mono text-sky-400 rounded border border-sky-950/30">
                                  {tg}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {filteredBooks.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-sky-300/60 italic text-sm bg-neutral-950 border border-sky-950 rounded-2xl">
                          No matching books found in celestial catalog.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: AI & Collaborative Recommendation Lab */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Mood-Based AI Recommendation Box */}
                    <div className="bg-neutral-950 p-5 rounded-2xl border border-sky-950 shadow-md flex flex-col justify-between space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                          <Sparkles className="w-4 h-4" />
                          <span>{t.moodRecommendation}</span>
                        </div>
                        <p className="text-xs text-sky-300 leading-relaxed font-sans">
                          Let our server-side Gemini AI analyze your mood or search vectors to match books from our active repository!
                        </p>

                        <form onSubmit={handleMoodSubmit} className="space-y-3">
                          <textarea
                            value={moodInput}
                            onChange={e => setMoodInput(e.target.value)}
                            placeholder={t.moodPlaceholder}
                            className="w-full h-20 bg-black border border-sky-950 p-3 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400 placeholder-sky-900 resize-none leading-relaxed"
                          />
                          <button
                            type="submit"
                            disabled={aiLoading || !moodInput.trim()}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-900 text-black font-black text-xs font-mono rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {aiLoading ? "AI Query Dispatched..." : t.askAi}
                          </button>
                        </form>
                      </div>

                      {/* AI Output results list */}
                      {aiSuggestions.length > 0 && (
                        <div className="mt-5 border-t border-sky-950/40 pt-4 space-y-3">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400 block">AI Suggestions:</span>
                          {aiSuggestions.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedBook(item.book)}
                              className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-xl hover:border-amber-500/30 cursor-pointer space-y-1.5 transition-all"
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-amber-400 truncate max-w-[150px]">{item.book.title}</span>
                                <span className="font-mono text-sky-300 font-bold shrink-0">{item.matchScore}% Match</span>
                              </div>
                              <p className="text-[11px] text-sky-300/80 leading-relaxed italic font-sans">"{item.reason}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Personalized Collaborative Filtering Feed */}
                    <div className="bg-neutral-950 p-5 rounded-2xl border border-sky-950 shadow-md space-y-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t.recommendations}</span>
                      </div>

                      {personalRecs.length > 0 ? (
                        <div className="space-y-3">
                          <span className="text-[9px] text-sky-400/80 font-mono">Calculated via User-Based Cosine Similarity</span>
                          {personalRecs.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedBook(item.book)}
                              className="group p-3 bg-black hover:bg-sky-950/20 border border-sky-950 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <div className="overflow-hidden pr-2">
                                <h5 className="font-serif font-bold text-xs text-amber-400 truncate group-hover:text-amber-300">
                                  {item.book.title}
                                </h5>
                                <p className="text-[10px] text-sky-400 truncate">Predicted Score: {item.predictedRating}/5.0</p>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold shrink-0 rounded-md">
                                {item.confidence}% Match
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2 text-center py-6 text-sky-300/60 text-xs">
                          <p className="italic">Not enough rated data yet.</p>
                          <button onClick={() => setActiveTab("matrix")} className="text-[10px] text-amber-400 font-mono underline hover:text-amber-300">
                            View Rating Matrix &rarr;
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Notification Feed Logs */}
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-sky-950 shadow-md space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-sky-400">
                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                        <span>Notification Feeds</span>
                      </div>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-[11px] font-sans text-sky-300/80">
                        {notifications.map((n, idx) => (
                          <div key={idx} className="p-2 bg-black rounded-lg border border-sky-950/40">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* Shelf Tab component */}
            {activeTab === "shelf" && (
              <VirtualBookshelf books={books} onSelectBook={setSelectedBook} />
            )}

            {/* Matrix Tab component */}
            {activeTab === "matrix" && (
              <SimilarityMatrix />
            )}

            {/* Admin panel Tab component */}
            {activeTab === "admin" && activeUser?.isAdmin && (
              <AdminPanel onBooksChanged={loadBooks} books={books} />
            )}

          </main>

          {/* DETAILED BOOK DIALOG MODAL */}
          {selectedBook && (
            <BookDetailsModal
              book={selectedBook}
              currentUser={activeUser}
              onClose={() => setSelectedBook(null)}
              onActionComplete={() => {
                loadBooks();
                loadRecommendations();
              }}
            />
          )}

          {/* FOOTER METRICS RAIL */}
          <footer className="mt-auto py-6 bg-black border-t border-sky-950 px-6 flex flex-col md:flex-row items-center justify-between text-xs text-sky-500 gap-4">
            <div className="font-mono text-[11px] text-sky-400">
              &copy; {new Date().getFullYear()} Celestial Book Haven. Designed with Google AI Studio.
            </div>
            <div className="flex gap-4 font-mono text-[10px] text-amber-400">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sky-400" /> Collaborative Filtering Active</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sky-400" /> In-Memory State Synchronized</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-sky-400" /> Gemini AI Enabled</span>
            </div>
          </footer>
        </>
      )}

    </div>
  );
}
