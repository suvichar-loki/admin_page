/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchLanguages,
  addCategory,
  deleteCategory,
  updateLanguages,
  fetchShuffleInfo,
  reRankAllImages,
  type Category,
} from "../api";
import "./config.css";

export function ConfigPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [lastShuffle, setLastShuffle] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCategoryEn, setNewCategoryEn] = useState("");
  const [newCategoryHi, setNewCategoryHi] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, langs, shuffleTime] = await Promise.all([
          fetchCategories(),
          fetchLanguages(),
          fetchShuffleInfo(),
        ]);

        setCategories(cats);
        setLanguages(langs);
        setLastShuffle(shuffleTime);
      } catch (err: any) {
        setError(err.message || "Failed to load config");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -----------------------------
  // Category Actions
  // -----------------------------
  const handleAddCategory = async () => {
    const en = newCategoryEn.trim();
    const hi = newCategoryHi.trim();
    if (!en) return alert("English label is required");

    if (categories.some((c) => c.key === en)) {
      alert("Category already exists");
      return;
    }

    try {
      setSaving(true);
      await addCategory({ en, hi });
      setCategories((prev) => [...prev, { key: en, labels: { en, hi } }]);
      setNewCategoryEn("");
      setNewCategoryHi("");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (key: string) => {
    if (!confirm(`Delete "${key}"?`)) return;

    try {
      setSaving(true);
      await deleteCategory(key);
      setCategories((prev) => prev.filter((c) => c.key !== key));
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Language Actions
  // -----------------------------
  const handleAddLanguage = async () => {
    const val = newLanguage.trim();
    if (!val || languages.includes(val)) return;

    try {
      setSaving(true);
      const updated = [...languages, val];
      await updateLanguages(updated);
      setLanguages(updated);
      setNewLanguage("");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Shuffle Images
  // -----------------------------
  const handleShuffleImages = async () => {
    if (!confirm("Shuffle all images?")) return;

    try {
      setShuffling(true);
      await reRankAllImages();

      const updatedTime = await fetchShuffleInfo();
      setLastShuffle(updatedTime);
    } catch (err: any) {
      alert(err.message || "Shuffle failed");
    } finally {
      setShuffling(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="config-page">
      {/* ---------- Header ---------- */}
      <div className="config-header">
        <h1>App Configuration</h1>
        {saving && <span className="saving">Saving…</span>}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {/* ---------- Categories ---------- */}
      <section className="config-card">
        <div className="card-header">
          <h2>Categories</h2>
          <div className="card-actions">
            <input
              placeholder="English"
              value={newCategoryEn}
              onChange={(e) => setNewCategoryEn(e.target.value)}
            />
            <input
              placeholder="Hindi (optional)"
              value={newCategoryHi}
              onChange={(e) => setNewCategoryHi(e.target.value)}
            />
            <button onClick={handleAddCategory} disabled={saving}>
              + Add
            </button>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.key} className="category-tile">
              <div>
                <strong>{cat.labels.en}</strong>
                {cat.labels.hi && (
                  <div className="muted">{cat.labels.hi}</div>
                )}
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteCategory(cat.key)}
                disabled={saving}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Languages ---------- */}
      <section className="config-card">
        <div className="card-header">
          <h2>Languages</h2>
          <div className="card-actions">
            <input
              placeholder="New language"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
            />
            <button onClick={handleAddLanguage} disabled={saving}>
              + Add
            </button>
          </div>
        </div>

        <div className="language-grid">
          {languages.map((lang) => (
            <div key={lang} className="language-chip">
              {lang}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Image Shuffle ---------- */}
      <section className="config-card">
        <div className="card-header">
          <h2>Image Ranking</h2>

          <div className="card-actions">
            <button
              onClick={handleShuffleImages}
              disabled={shuffling}
              className="shuffle-btn"
            >
              {shuffling ? "Shuffling…" : "Shuffle Images"}
            </button>

            <span className="muted">
              Last:{" "}
              {lastShuffle
                ? new Date(lastShuffle).toLocaleString()
                : "Never"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
