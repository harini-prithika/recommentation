import React, { useState, useEffect } from "react";
import { Book } from "../types";
import { Plus, Edit2, Trash2, Save, X, BookCheck, AlertCircle } from "lucide-react";

interface AdminPanelProps {
  onBooksChanged: () => void;
  books: Book[];
}

export default function AdminPanel({ onBooksChanged, books }: AdminPanelProps) {
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Novel",
    description: "",
    publishYear: new Date().getFullYear(),
    pages: 220
  });

  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "Novel",
      description: "",
      publishYear: new Date().getFullYear(),
      pages: 220
    });
    setEditingBook(null);
  };

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      publishYear: book.publishYear,
      pages: book.pages
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      setMessage({ text: "Title and Author are required fields.", isError: true });
      return;
    }

    try {
      const endpoint = editingBook ? `/api/books/${editingBook.id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Database transaction failed");

      const data = await res.json();
      if (data.success) {
        setMessage({
          text: editingBook ? "Book details updated successfully." : "New book cataloged successfully.",
          isError: false
        });
        resetForm();
        onBooksChanged();
      }
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book? This will also purge associated user ratings.")) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete book");
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Book has been removed from catalogs.", isError: false });
        onBooksChanged();
      }
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const categories = ["Novel", "Programming", "History", "Science", "Self-Help"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-black text-sky-300">
      {/* Form Section */}
      <div className="lg:col-span-1 bg-neutral-950 p-6 rounded-3xl border border-sky-950 shadow-xl flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <BookCheck className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-bold text-lg text-amber-400">
            {editingBook ? "Edit Book Metadata" : "Add New Book Catalog"}
          </h3>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 border ${
            message.isError 
              ? "bg-red-950/40 border-red-500/30 text-red-400" 
              : "bg-sky-950/40 border-sky-500/30 text-sky-300"
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-sky-400 font-mono block mb-1">Book Title*</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Clean Code"
              className="w-full bg-black border border-sky-950 p-2.5 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs text-sky-400 font-mono block mb-1">Author Name*</label>
            <input
              type="text"
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Robert C. Martin"
              className="w-full bg-black border border-sky-950 p-2.5 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-sky-400 font-mono block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black border border-sky-950 p-2.5 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-black text-sky-300">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-sky-400 font-mono block mb-1">Publish Year</label>
              <input
                type="number"
                value={formData.publishYear}
                onChange={e => setFormData({ ...formData, publishYear: Number(e.target.value) })}
                className="w-full bg-black border border-sky-950 p-2.5 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-sky-400 font-mono block mb-1">Total Pages</label>
            <input
              type="number"
              value={formData.pages}
              onChange={e => setFormData({ ...formData, pages: Number(e.target.value) })}
              className="w-full bg-black border border-sky-950 p-2.5 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-sky-400 font-mono block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief synopsis of the book content..."
              className="w-full h-24 bg-black border border-sky-950 p-2.5 rounded-lg text-xs text-sky-300 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Save className="w-4 h-4 text-black" />
              {editingBook ? "Update Catalog" : "Save to Catalog"}
            </button>
            {editingBook && (
              <button
                type="button"
                onClick={resetForm}
                className="p-2.5 bg-neutral-900 border border-sky-950 hover:bg-sky-950/30 text-sky-300 rounded-lg transition-colors cursor-pointer"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Database Listing Section */}
      <div className="lg:col-span-2 bg-neutral-950 p-6 rounded-3xl border border-sky-950 shadow-xl flex flex-col overflow-hidden">
        <h3 className="font-serif font-bold text-lg text-amber-400 mb-4">Active Database Catalog ({books.length})</h3>
        
        <div className="flex-1 overflow-y-auto max-h-[480px] border border-sky-950 rounded-xl bg-black p-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-900 text-sky-300 border-b border-sky-950/50 font-mono">
                <th className="p-3 text-amber-400">Title & Author</th>
                <th className="p-3 text-sky-300">Category</th>
                <th className="p-3 text-center text-sky-300">Rating</th>
                <th className="p-3 text-right text-sky-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-950/45">
              {books.map(b => (
                <tr key={b.id} className="hover:bg-sky-950/20 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-sky-300 truncate max-w-[180px]">{b.title}</div>
                    <div className="text-[10px] text-sky-400 truncate max-w-[180px]">{b.author}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-sky-950/40 text-sky-400 rounded-full text-[10px] font-mono border border-sky-950/30">
                      {b.category}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-amber-400 font-bold">
                    {b.averageRating ? `${b.averageRating} ⭐` : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="p-1.5 hover:bg-amber-500/15 text-sky-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                        title="Edit metadata"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 hover:bg-red-500/15 text-sky-300 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
