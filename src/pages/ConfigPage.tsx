/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ConfigPage.tsx
import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchLanguages,
  updateCategories,
  updateLanguages,
} from "../api";

export function ConfigPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState("");
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
    const val = newCategory.trim();
    if (!val) return;
    if (categories.includes(val)) {
      alert("Category already exists.");
      return;
    }
    try {
      setSaving(true);
      const updated = [...categories, val];
      await updateCategories(updated);
      setCategories(updated);
      setNewCategory("");
    } catch (err: any) {
      alert(err.message || "Failed to save categories");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLanguage = async () => {
    const val = newLanguage.trim();
    if (!val) return;
    if (languages.includes(val)) {
      alert("Language already exists.");
      return;
    }
    try {
      setSaving(true);
      const updated = [...languages, val];
      await updateLanguages(updated);
      setLanguages(updated);
      setNewLanguage("");
    } catch (err: any) {
      alert(err.message || "Failed to save languages");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Config</h1>
      {loading && <p>Loading config…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="config-section">
        <h2>Categories</h2>
        <ul>
          {categories.map((cat) => (
            <li key={cat}>{cat}</li>
          ))}
        </ul>
        <div className="config-add-row">
          <input
            type="text"
            value={newCategory}
            placeholder="New category"
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button disabled={saving} onClick={handleAddCategory}>
            Add
          </button>
        </div>
      </div>

      <div className="config-section">
        <h2>Languages</h2>
        <ul>
          {languages.map((lang) => (
            <li key={lang}>{lang}</li>
          ))}
        </ul>
        <div className="config-add-row">
          <input
            type="text"
            value={newLanguage}
            placeholder="New language"
            onChange={(e) => setNewLanguage(e.target.value)}
          />
          <button disabled={saving} onClick={handleAddLanguage}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
