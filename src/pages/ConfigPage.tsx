/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchLanguages,
  addCategory,
  deleteCategory,
  updateLanguages,
  type Category,
} from "../api";
import './config.css'

export function ConfigPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCategoryEn, setNewCategoryEn] = useState("");
  const [newCategoryHi, setNewCategoryHi] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, langs] = await Promise.all([
          fetchCategories(),
          fetchLanguages(),
        ]);

        setCategories(cats);
        setLanguages(langs);
      } catch (err: any) {
        setError(err.message || "Failed to load config");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
    </div>
  );
}
