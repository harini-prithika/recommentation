import { useState } from "react";
import { Book } from "../types";
import { BookOpen, Star, Grid, Sparkles, Filter, Search, Landmark, Atom, Cpu, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VirtualBookshelfProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export default function VirtualBookshelf({ books, onSelectBook }: VirtualBookshelfProps) {
  const [viewMode, setViewMode] = useState<"spine" | "cover">("cover");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [localSearch, setLocalSearch] = useState<string>("");

  // Filter books inside the shelf
  const filtered = books.filter(book => {
    const matchesCategory = categoryFilter === "All" || book.category === categoryFilter;
    const matchesSearch = book.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                          book.author.toLowerCase().includes(localSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group books into shelves of up to 6 books
  const shelves: Book[][] = [];
  const booksPerShelf = 6;
  for (let i = 0; i < filtered.length; i += booksPerShelf) {
    shelves.push(filtered.slice(i, i + booksPerShelf));
  }

  // Generate ornament icons based on category
  const getCategoryOrnament = (category: string) => {
    switch (category) {
      case "Novel":
        return <Compass className="w-5 h-5 text-amber-400 opacity-90" />;
      case "History":
        return <Landmark className="w-5 h-5 text-amber-500 opacity-90" />;
      case "Science":
        return <Atom className="w-5 h-5 text-sky-400 opacity-90" />;
      case "Programming":
        return <Cpu className="w-5 h-5 text-emerald-400 opacity-90" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-400 opacity-90" />;
    }
  };

  return (
    <div className="w-full bg-black border border-sky-950/50 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(14,165,233,0.05)] backdrop-blur-md">
      
      {/* Shelf Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-sky-950/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-400 tracking-tight flex items-center gap-2">
              The Celestial Book Haven
              <span className="text-[10px] font-sans font-normal tracking-wide bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                Interactive Cosmic Shelf
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-sky-300 font-sans mt-0.5">
              Explore your literary cosmos in pure deep dark gold and light blue style. Move over any book to animate.
            </p>
          </div>
        </div>

        {/* View Mode & Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-sky-950/50">
            <button
              onClick={() => setViewMode("cover")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "cover"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-sky-300 hover:text-amber-400"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Covers
            </button>
            <button
              onClick={() => setViewMode("spine")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "spine"
                  ? "bg-amber-500 text-black font-bold"
                  : "text-sky-300 hover:text-amber-400"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Classic Spines
            </button>
          </div>
        </div>
      </div>

      {/* Local Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input
            type="text"
            placeholder="Search within this cosmic cabinet..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-sky-950 p-3 pl-10 rounded-xl text-xs text-sky-300 focus:outline-none focus:border-amber-400 transition-all font-sans"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 md:col-span-2 items-center">
          <Filter className="w-3.5 h-3.5 text-amber-400 mr-1 hidden sm:inline" />
          {["All", "Novel", "Programming", "History", "Science"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "bg-transparent border-transparent text-sky-300 hover:bg-sky-500/10 hover:text-sky-200"
              }`}
            >
              {cat === "All" ? "All Subjects" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Cabinet Shelving */}
      <div className="flex flex-col gap-16 py-6 overflow-hidden">
        {shelves.length === 0 ? (
          <div className="text-center py-16 text-sky-300/60 font-serif italic text-base">
            "Alas, no celestial books match your query in this chamber..."
          </div>
        ) : (
          shelves.map((shelfBooks, shelfIdx) => (
            <div key={shelfIdx} className="relative w-full flex flex-col items-center">
              
              {/* Shelf Stage (Perspective Backdrop Container) */}
              <div 
                className={`w-full max-w-5xl flex justify-center items-end px-6 gap-4 md:gap-6 z-10 select-none ${
                  viewMode === "cover" ? "h-64" : "h-52"
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {shelfBooks.map((book) => {
                    
                    // Render Cover View Mode
                    if (viewMode === "cover") {
                      return (
                        <motion.div
                          key={book.id}
                          onClick={() => onSelectBook(book)}
                          initial={{ opacity: 0, y: 30, rotateY: 15 }}
                          animate={{ opacity: 1, y: 0, rotateY: -10 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ 
                            y: -24, 
                            rotateY: 0, 
                            scale: 1.1,
                            z: 50,
                            boxShadow: "0 20px 30px rgba(14,165,233,0.3), 0 0 15px rgba(245,158,11,0.2)"
                          }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          className="relative w-28 sm:w-36 h-48 sm:h-56 bg-neutral-950 border-2 border-amber-500/30 hover:border-sky-400 rounded-r-xl shadow-2xl cursor-pointer flex flex-col justify-between p-3 overflow-hidden origin-bottom group"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Real Book Cover Image Background */}
                          {book.coverImage && (
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/30 z-10" />

                          {/* Book spine simulated edge on left */}
                          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/60 rounded-l-sm border-r border-sky-400/25 z-20" />
                          
                          {/* Classical Ornate Border Frame */}
                          <div className="absolute inset-1.5 border border-sky-400/10 pointer-events-none rounded-sm z-10" />
                          <div className="absolute inset-2 border-2 border-double border-amber-500/10 pointer-events-none rounded-sm z-10" />

                          {/* Top: Category Tag and Icon */}
                          <div className="flex justify-between items-center z-20">
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest font-serif text-sky-300 truncate max-w-[80px]">
                              {book.category}
                            </span>
                            {getCategoryOrnament(book.category)}
                          </div>

                          {/* Center: Title & Author (Classical Serif Style) */}
                          <div className="flex-1 flex flex-col justify-center items-center text-center px-1 z-20 my-1">
                            <h4 className="font-serif font-bold text-[10px] sm:text-xs leading-tight tracking-normal text-amber-400 bg-gradient-to-b from-amber-300 to-amber-500 bg-clip-text text-transparent line-clamp-3 mb-1">
                              {book.title}
                            </h4>
                            <p className="text-[8px] sm:text-[9px] font-serif italic text-sky-300 truncate max-w-[100px]">
                              by {book.author}
                            </p>
                          </div>

                          {/* Bottom: Book Details & Star Badge */}
                          <div className="flex justify-between items-end pt-1 border-t border-sky-950/40 z-20">
                            <span className="text-[7px] sm:text-[8px] font-mono text-sky-300">
                              {book.pages} pp
                            </span>
                            <div className="flex items-center gap-0.5 bg-black/50 px-1 py-0.5 rounded border border-amber-500/20">
                              <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                              <span className="text-[7px] sm:text-[8px] font-mono text-amber-400 font-bold">
                                {book.averageRating || "0"}
                              </span>
                            </div>
                          </div>

                          {/* Shine Highlight Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-20 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none z-20" />
                        </motion.div>
                      );
                    }

                    // Render 3D Spine View Mode
                    const heightClass = book.pages > 500 ? "h-44 sm:h-48" : book.pages > 300 ? "h-38 sm:h-42" : "h-32 sm:h-36";
                    const widthClass = book.pages > 800 ? "w-11 sm:w-14" : book.pages > 400 ? "w-9 sm:w-11" : "w-7.5 sm:w-9";

                    return (
                      <motion.div
                        key={book.id}
                        onClick={() => onSelectBook(book)}
                        initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
                        animate={{ opacity: 1, scale: 1, rotateY: -15 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{
                          rotateY: 0,
                          scale: 1.15,
                          y: -20,
                          z: 50,
                          boxShadow: "0 15px 30px rgba(14,165,233,0.3)"
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 18 }}
                        className={`relative ${heightClass} ${widthClass} bg-neutral-950 border border-amber-500/30 rounded-md cursor-pointer flex flex-col justify-between py-4 px-1.5 text-white border-l-2 border-l-sky-500/30 border-r-2 border-r-black/50 overflow-hidden group`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Ribbed Spine Horizontal Bands */}
                        <div className="absolute top-4 left-0 right-0 h-1 bg-black/50 border-y border-amber-500/20" />
                        <div className="absolute top-10 left-0 right-0 h-1.5 bg-black/50 border-y border-amber-500/20" />
                        <div className="absolute bottom-10 left-0 right-0 h-1.5 bg-black/50 border-y border-amber-500/20" />
                        <div className="absolute bottom-4 left-0 right-0 h-1 bg-black/50 border-y border-amber-500/20" />

                        {/* Gold Foil Accent Line */}
                        <div className="absolute top-[18px] left-0 right-0 h-[1px] bg-amber-400/40" />
                        <div className="absolute bottom-[18px] left-0 right-0 h-[1px] bg-amber-400/40" />

                        {/* Author Label */}
                        <span className="text-[8px] sm:text-[9px] font-serif tracking-widest text-center text-sky-300 uppercase truncate px-0.5 z-10">
                          {book.author.split(",")[0].split(" ").pop()?.substring(0, 4) || "AUTH"}
                        </span>

                        {/* Title text rotated vertically */}
                        <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
                          <span className="text-[9px] sm:text-[10px] font-serif uppercase tracking-widest whitespace-nowrap rotate-270 origin-center text-amber-400 font-bold group-hover:text-amber-300 transition-colors truncate max-w-[120px] block">
                            {book.title}
                          </span>
                        </div>

                        {/* Book average rating score */}
                        <div className="flex flex-col items-center gap-0.5 mt-auto z-10">
                          <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                          <span className="text-[7px] sm:text-[8px] font-mono text-amber-400 font-bold">
                            {book.averageRating || "0.0"}
                          </span>
                        </div>

                        {/* Shine reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-10 group-hover:opacity-45 transition-opacity pointer-events-none" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Wooden Shelf Stage Structure (Rich Classic Mahogany & Gold Theme) */}
              <div className="relative w-full max-w-5xl h-8 rounded-lg bg-neutral-950 border-t border-b border-amber-500/30 shadow-[0_15px_30px_rgba(14,165,233,0.1)] flex items-center justify-between px-6 z-20 -mt-1 select-none">
                
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-sky-400/25 pointer-events-none" />
                
                {/* Vintage Brass Nameplate with Light Blue / Gold look */}
                <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-neutral-900 to-black border border-amber-500/50 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                  <span className="text-[8px] sm:text-[9px] font-serif text-sky-300 font-bold tracking-widest uppercase">
                    CABINET CE-{(shelfIdx + 1 + 10).toString(16).toUpperCase()}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                </div>

                <span className="text-[8px] sm:text-[9px] font-mono text-amber-400/70 font-semibold tracking-wider uppercase">
                  {filtered.length} volumes in this panel
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Helper Note */}
      <div className="mt-8 text-center bg-neutral-950 p-4 border border-sky-950 rounded-2xl">
        <p className="text-[11px] font-serif text-sky-300 italic">
          "Each piece in this collection is mathematically vectorized with cosine similarity parameters in the backend repository."
        </p>
      </div>

    </div>
  );
}
