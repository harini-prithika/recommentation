import { useState } from "react";
import { JAVA_PROJECT_FILES, JavaFile } from "../javaSource";
import { Copy, Check, Download, Code2, BookOpen, ChevronDown, ChevronUp, Sparkles, Terminal } from "lucide-react";
import JSZip from "jszip";

export default function JavaExporter() {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expandedVivaIdx, setExpandedVivaIdx] = useState<number | null>(null);

  const selectedFile = JAVA_PROJECT_FILES[selectedFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: JavaFile) => {
    const element = document.createElement("a");
    const fileBlob = new Blob([file.code], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleDownloadAll = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      
      // Maven Directory structure mapping:
      // pom.xml and README.md go to the project root
      // Java classes go under src/main/java/com/recsys/
      JAVA_PROJECT_FILES.forEach(file => {
        const nameLower = file.name.toLowerCase();
        if (nameLower === "pom.xml" || nameLower === "readme.md") {
          zip.file(file.name, file.code);
        } else {
          zip.file(`src/main/java/com/recsys/${file.name}`, file.code);
        }
      });
      
      const content = await zip.generateAsync({ type: "blob" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = "java_book_recommendation_project.zip";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const VIVA_QUESTIONS = [
    {
      q: "Explain how Collaborative Filtering works in this Java project.",
      a: "In this project, we implement User-Based Collaborative Filtering. The algorithm builds a user-to-item rating matrix. When a target user requests suggestions, the engine measures the Cosine Similarity of their ratings against all other users. It selects the users with the highest similarity (nearest neighbors) and computes a weighted average of their ratings for books the target user has not yet read to predict their rating. Books with the highest predicted ratings are recommended."
    },
    {
      q: "What is Cosine Similarity? What is the mathematical formula used?",
      a: "Cosine Similarity is a metric used to measure how similar two vectors are, based on the angle between them in a multi-dimensional space. The formula is:\n\nCos(A, B) = (A \u2219 B) / (||A|| * ||B||)\n\nWhere 'A \u2219 B' is the dot product of the common rating vectors, and '||A||' & '||B||' represent the Euclidean Norm of each user's entire rating history. The value ranges from 0.0 (no similarity) to 1.0 (identical tastes)."
    },
    {
      q: "How does the confidence match score (e.g. '95% match') get calculated?",
      a: "In our algorithm, the match confidence is derived directly from the average similarity score of the neighboring users who rated that specific book. If multiple highly similar users rated the book, the confidence is high. We map this similarity coefficient mathematically to a percentage between 50% and 99% to display as 'Confidence Match' in the user interface."
    },
    {
      q: "How is data persisted in this Java system? Why did you choose SQLite?",
      a: "We utilize SQLite through JDBC (Java Database Connectivity) via the 'org.sqlite.JDBC' driver. SQLite is a lightweight, serverless relational database that stores the database tables (users, books, ratings, wishlists, favorites) in a single localized file named 'recommendation_system.db'. This is perfect for academic projects because it eliminates complex DB installations (like MySQL) while retaining complete SQL schema capabilities (Foreign Keys, Primary Keys, PreparedStatement, etc.)."
    },
    {
      q: "What is the 'Cold Start Problem' and how did you resolve it?",
      a: "The Cold Start problem happens when a new user joins who has rated no books, making it impossible to calculate similarity vectors. We resolve this by (1) showcasing general trending/popular books in the system, (2) prompting the user for language and goals, and (3) incorporating a rule-based or AI hybrid system (like our mood-based recommender) until they leave enough ratings to calculate collaborative similarities."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-amber-600/10 via-amber-700/5 to-transparent border border-amber-500/20 dark:border-amber-800/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-500 rounded font-mono text-xs font-bold uppercase">Academic ready</span>
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
          </div>
          <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">Java Source Code Exporter</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Download or copy complete, structured, compilable Java source files backed by SQLite JDBC.
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={downloadingZip}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-stone-950 font-black text-xs font-mono rounded-xl flex items-center justify-center gap-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-stone-950" />
          {downloadingZip ? "Generating ZIP..." : "Download Java Project (.zip)"}
        </button>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left File Selector list */}
        <div className="lg:col-span-1 flex flex-col gap-2 p-3 bg-white dark:bg-stone-950/40 rounded-xl border border-stone-200 dark:border-stone-800/30 shadow-md">
          <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 p-2 block">Source Code Trees</span>
          {JAVA_PROJECT_FILES.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setSelectedFileIdx(idx)}
              className={`w-full text-left p-3 rounded-lg text-xs font-mono flex items-center justify-between transition-all border ${
                selectedFileIdx === idx
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500 font-bold shadow"
                  : "bg-transparent border-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/20 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Code2 className="w-4 h-4 shrink-0 text-stone-400" />
                <span className="truncate">{file.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Code view panel */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800/20 backdrop-blur-sm shadow-md overflow-hidden">
          {/* Header toolbar */}
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900/30 border-b border-stone-200 dark:border-stone-850">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-200">{selectedFile.name}</span>
              <p className="text-[10px] text-stone-500">{selectedFile.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-stone-500 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="p-2 text-stone-500 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-all cursor-pointer"
                title="Download this file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pre-formatted code wrapper */}
          <div className="p-4 overflow-auto max-h-[420px] bg-stone-900 dark:bg-black/40 border-b border-stone-200 dark:border-stone-850">
            <pre className="font-mono text-xs text-stone-200 dark:text-stone-300 leading-relaxed whitespace-pre select-all">
              <code>{selectedFile.code}</code>
            </pre>
          </div>

          {/* Direct copy footer instructions */}
          <div className="p-3 bg-stone-50 dark:bg-stone-950/80 px-4 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-stone-400" />
              <span>Standard com.recsys package namespace.</span>
            </div>
            <span>{selectedFile.code.split("\n").length} Lines</span>
          </div>
        </div>
      </div>

      {/* VIVA PREP SECTION */}
      <div className="bg-white dark:bg-stone-950/60 p-6 rounded-2xl border border-stone-200 dark:border-stone-800/20 backdrop-blur-sm shadow-md mt-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">Examiner Viva Q&A Guide</h3>
            <p className="text-xs text-stone-500">Perfect your explanations during project viva exams</p>
          </div>
        </div>

        <div className="space-y-3">
          {VIVA_QUESTIONS.map((item, idx) => {
            const isExpanded = expandedVivaIdx === idx;
            return (
              <div
                key={idx}
                className="border border-stone-200 dark:border-stone-800/40 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedVivaIdx(isExpanded ? null : idx)}
                  className="w-full text-left p-4 bg-stone-50 dark:bg-stone-900/10 hover:bg-stone-100 dark:hover:bg-stone-800/10 flex items-center justify-between font-medium text-stone-800 dark:text-stone-200 text-sm cursor-pointer"
                >
                  <span className="pr-4">{item.q}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/20 border-t border-stone-200 dark:border-stone-850 text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans whitespace-pre-line">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
