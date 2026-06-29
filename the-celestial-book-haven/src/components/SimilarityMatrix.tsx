import { useState, useEffect } from "react";
import { Calculator, Grid, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface MatrixData {
  matrix: Record<string, Record<string, number>>;
  similarityMatrix: Record<string, Record<string, number>>;
  books: { id: string; title: string }[];
  users: string[];
}

export default function SimilarityMatrix() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<{ u1: string; u2: string } | null>(null);

  // Fetch matrix values from full-stack api
  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/matrix");
      if (!res.ok) throw new Error("Could not load similarity matrix data.");
      const json = await res.json();
      setData(json);
      
      // Select default users for calculator
      if (json.users.length >= 2) {
        setSelectedUsers({ u1: json.users[0], u2: json.users[1] });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-black rounded-2xl border border-sky-950 shadow-lg">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-sky-300 font-mono">Computing Collaborative Vectors...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-black text-red-400 rounded-2xl border border-red-900/40">
        <p className="font-mono mb-2 font-bold text-amber-400">Error calculating recommendation matrices:</p>
        <p className="text-xs text-sky-300">{error || "Server disconnected"}</p>
        <button onClick={fetchMatrix} className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          Retry Matrix Computation
        </button>
      </div>
    );
  }

  // Calculate detailed formula values for selected users
  const getCalculationDetails = () => {
    if (!selectedUsers || !data) return null;
    const { u1, u2 } = selectedUsers;
    const u1Ratings = data.matrix[u1] || {};
    const u2Ratings = data.matrix[u2] || {};

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    const commonRatings: { bookTitle: string; r1: number; r2: number; term: number }[] = [];

    data.books.forEach(book => {
      const r1 = u1Ratings[book.id] || 0;
      const r2 = u2Ratings[book.id] || 0;

      if (r1 > 0) norm1 += r1 * r1;
      if (r2 > 0) norm2 += r2 * r2;

      if (r1 > 0 && r2 > 0) {
        const product = r1 * r2;
        dotProduct += product;
        commonRatings.push({
          bookTitle: book.title,
          r1,
          r2,
          term: product
        });
      }
    });

    const sqrtNorm1 = Math.sqrt(norm1);
    const sqrtNorm2 = Math.sqrt(norm2);
    const denominator = sqrtNorm1 * sqrtNorm2;
    const similarity = denominator === 0 ? 0 : dotProduct / denominator;

    return {
      u1,
      u2,
      dotProduct,
      norm1,
      norm2,
      sqrtNorm1: sqrtNorm1.toFixed(4),
      sqrtNorm2: sqrtNorm2.toFixed(4),
      denominator: denominator.toFixed(4),
      similarity: similarity.toFixed(4),
      commonRatings
    };
  };

  const details = getCalculationDetails();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User-Item Matrix Table */}
      <div className="lg:col-span-2 flex flex-col bg-black p-6 rounded-3xl border border-sky-950/50 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Grid className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-400">User-Item Rating Matrix</h3>
            <p className="text-xs text-sky-300">{"Live database grid representing historical user ratings ($R_{u,i}$)"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto border border-sky-950 rounded-xl bg-neutral-950 p-1">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-neutral-900 text-sky-300 border-b border-sky-950/45">
                <th className="p-3 font-semibold text-amber-400">User Profile</th>
                {data.books.map(b => (
                  <th key={b.id} className="p-3 font-semibold text-sky-300 min-w-[100px] text-center" title={b.title}>
                    {b.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-950/40">
              {data.users.map(u => (
                <tr key={u} className="hover:bg-sky-950/20 transition-colors">
                  <td className="p-3 font-bold text-amber-400 bg-neutral-900/40">
                    {u}
                  </td>
                  {data.books.map(b => {
                    const rating = data.matrix[u]?.[b.id];
                    return (
                      <td key={b.id} className="p-3 text-center">
                        {rating ? (
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                          >
                            {rating} ⭐
                          </motion.span>
                        ) : (
                          <span className="text-sky-900">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User-User Cosine Similarity Matrix */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4.5 h-4.5 text-amber-400" />
            <h4 className="font-serif font-semibold text-sm text-amber-400">User-User Cosine Similarity Matrix ($Sim(u,v)$)</h4>
          </div>
          <div className="overflow-x-auto border border-sky-950 rounded-xl bg-neutral-950 p-1">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-neutral-900 text-sky-300 border-b border-sky-950/45">
                  <th className="p-2.5 text-amber-400">Similarity</th>
                  {data.users.map(u => (
                    <th key={u} className="p-2.5 text-center text-sky-300">{u}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-950/40">
                {data.users.map(u1 => (
                  <tr key={u1} className="hover:bg-sky-950/10">
                    <td className="p-2.5 font-bold text-amber-400 bg-neutral-900/30">{u1}</td>
                    {data.users.map(u2 => {
                      const sim = data.similarityMatrix[u1]?.[u2] ?? 0;
                      // Dynamic color grading based on similarity using light blue and gold mix
                      const bgStyle = u1 === u2 
                        ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30" 
                        : sim > 0.7 
                          ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30" 
                          : sim > 0.3 
                            ? "bg-sky-950/40 text-sky-400 border border-sky-950" 
                            : "bg-neutral-950 text-sky-900/60";
                      return (
                        <td 
                          key={u2} 
                          onClick={() => setSelectedUsers({ u1, u2 })}
                          className={`p-2.5 text-center cursor-pointer hover:ring-2 hover:ring-sky-400 rounded-sm transition-all ${bgStyle}`}
                          title={`Click to analyze similarity between ${u1} and ${u2}`}
                        >
                          {sim.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real-time Math Explanation Panel */}
      <div className="flex flex-col bg-black p-6 rounded-3xl border border-sky-950/50 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-400">Similarity Lab</h3>
            <p className="text-xs text-sky-300">Live mathematical calculation logs</p>
          </div>
        </div>

        {details ? (
          <div className="flex-1 flex flex-col text-sky-300 space-y-4">
            <div className="p-3.5 bg-sky-950/20 border border-sky-900/30 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider font-mono text-amber-400 font-semibold block mb-1">Active Vectors</span>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-amber-400 font-mono">{details.u1}</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
                <span className="text-amber-400 font-mono">{details.u2}</span>
              </div>
            </div>

            {/* Math Formula display */}
            <div className="p-4 bg-neutral-950 border border-sky-950 rounded-xl space-y-2">
              <span className="text-[10px] text-sky-400 uppercase tracking-widest block font-mono">Cosine Formula</span>
              <div className="text-xs font-mono text-center py-2 bg-black border border-sky-950 rounded p-2 font-semibold text-amber-400">
                {"Sim(u, v) = \u2211(R\u1d64,\u1d47 * R\u1d65,\u1d47) / \u221a\u2211(R\u1d64,\u1d47\u00b2) * \u221a\u2211(R\u1d65,\u1d47\u00b2)"}
              </div>
            </div>

            {/* Overlapping ratings step */}
            <div className="space-y-2">
              <span className="text-[10px] text-sky-400 uppercase tracking-widest block font-mono">1. Dot Product (Co-Rated items)</span>
              {details.commonRatings.length === 0 ? (
                <div className="text-xs text-sky-400 italic p-3 bg-neutral-950 rounded-lg border border-sky-950">
                  No co-rated books between these two users. Dot Product = 0.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-2">
                  {details.commonRatings.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-neutral-950 border border-sky-950 rounded-lg hover:border-amber-500/30 transition-all">
                      <span className="truncate max-w-[120px] font-medium text-sky-300" title={item.bookTitle}>{item.bookTitle}</span>
                      <span className="font-mono text-sky-400 text-[11px]">{item.r1}⭐ × {item.r2}⭐ = <strong className="text-amber-400">{item.term}</strong></span>
                    </div>
                  ))}
                  <div className="text-right text-xs font-mono font-bold text-amber-400 pt-1">
                    Sum = {details.dotProduct}
                  </div>
                </div>
              )}
            </div>

            {/* Vector Norm steps */}
            <div className="space-y-2">
              <span className="text-[10px] text-sky-400 uppercase tracking-widest block font-mono">2. Vector Magnitudes (Norms)</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-neutral-950 border border-sky-950 rounded-lg">
                  <span className="text-[10px] text-sky-400 block font-mono">||{details.u1}||</span>
                  <span className="font-mono font-bold text-amber-400">√{details.norm1} = {details.sqrtNorm1}</span>
                </div>
                <div className="p-2.5 bg-neutral-950 border border-sky-950 rounded-lg">
                  <span className="text-[10px] text-sky-400 block font-mono">||{details.u2}||</span>
                  <span className="font-mono font-bold text-amber-400">√{details.norm2} = {details.sqrtNorm2}</span>
                </div>
              </div>
            </div>

            {/* Output result */}
            <div className="pt-2 mt-auto border-t border-sky-950/55">
              <span className="text-[10px] text-sky-400 uppercase tracking-widest block font-mono mb-1">3. Final Calculation Result</span>
              <div className="p-3 bg-sky-950/40 border border-sky-900/50 text-sky-300 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                <div className="font-mono text-xs text-amber-400">
                  {details.dotProduct} / ({details.sqrtNorm1} * {details.sqrtNorm2})
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-sky-400 uppercase font-mono block">SIMILARITY</span>
                  <span className="text-lg font-mono font-bold text-amber-400">{details.similarity}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-sky-400/60 py-12">
            <HelpCircle className="w-8 h-8 text-sky-500 mb-2" />
            <p className="text-sm font-mono">Select any cell in the similarity grid to open the live execution lab.</p>
          </div>
        )}
      </div>
    </div>
  );
}
