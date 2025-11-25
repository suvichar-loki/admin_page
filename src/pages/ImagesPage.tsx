/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ImagesPage.tsx
import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchLanguages,
  fetchImages,
  deleteImage,
  uploadImage,
  type Image,
} from "../api";
import { positionLabel } from "../position";
import { PositionGuide } from "../components/PositionGuide";

export function ImagesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [formCategory, setFormCategory] = useState("");
  const [formLanguage, setFormLanguage] = useState("");
  const [position, setPosition] = useState<number>(8); // middle top default
  const [isDate, setIsDate] = useState(false);
  const [showOnDate, setShowOnDate] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cats, langs] = await Promise.all([
          fetchCategories(),
          fetchLanguages(),
        ]);
        setCategories(cats);
        setLanguages(langs);
        // default selection for upload form
        setFormCategory(cats[0] || "");
        setFormLanguage(langs[0] || "");
        const imgs = await fetchImages({});
        setImages(imgs);
      } catch (err: any) {
        alert(err.message || "Failed to load images");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reloadImages = async () => {
    try {
      setLoading(true);
      const imgs = await fetchImages({
        category: filterCategory || undefined,
        language: filterLanguage || undefined,
      });
      setImages(imgs);
    } catch (err: any) {
      alert(err.message || "Failed to reload images");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (img: Image) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteImage(img.id);
      await reloadImages();
    } catch (err: any) {
      alert(err.message || "Failed to delete image");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please choose an image file.");
      return;
    }
    if (!formCategory || !formLanguage) {
      alert("Please select category and language.");
      return;
    }
    try {
      setUploading(true);
      await uploadImage({
        file,
        category: formCategory,
        language: formLanguage,
        position,
        isDate,
        showOnDate: isDate && showOnDate ? showOnDate : null,
      });
      // clear file
      setFile(null);
      (e.target as HTMLFormElement).reset();
      setShowOnDate("");
      // reload
      await reloadImages();
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Images</h1>

      <section className="filters">
        <h2>Filter</h2>
        <div className="filter-row">
          <label>
            Category:
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Language:
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
            >
              <option value="">All</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <button onClick={reloadImages} disabled={loading}>
            Apply
          </button>
        </div>
      </section>

      <section className="upload-section">
        <h2>Upload New Image</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <label>
            File:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <label>
            Category:
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Language:
            <select
              value={formLanguage}
              onChange={(e) => setFormLanguage(e.target.value)}
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <label>
            Position:
            <select
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            >
              <option value={1}>1 - Right Top</option>
              <option value={2}>2 - Right Middle</option>
              <option value={3}>3 - Right Bottom</option>
              <option value={4}>4 - Middle Bottom</option>
              <option value={5}>5 - Left Bottom</option>
              <option value={6}>6 - Left Middle</option>
              <option value={7}>7 - Left Top</option>
              <option value={8}>8 - Middle Top (default)</option>
            </select>
          </label>

          <label>
            Is Date-based?
            <input
              type="checkbox"
              checked={isDate}
              onChange={(e) => setIsDate(e.target.checked)}
            />
          </label>

          {isDate && (
            <label>
              Show On Date:
              <input
                type="date"
                value={showOnDate}
                onChange={(e) => setShowOnDate(e.target.value)}
              />
            </label>
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

        <PositionGuide />
      </section>

      <section className="image-list">
        <h2>Images List</h2>
        {loading && <p>Loading images…</p>}
        {!loading && images.length === 0 && <p>No images found.</p>}

        {!loading && images.length > 0 && (
          <table className="image-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Category</th>
                <th>Language</th>
                <th>Position</th>
                <th>Is Date?</th>
                <th>Show On</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id}>
                  <td>
                    <img
                      src={img.imageUrl}
                      alt=""
                      style={{ maxWidth: "80px", maxHeight: "80px" }}
                    />
                  </td>
                  <td>{img.category}</td>
                  <td>{img.language}</td>
                  <td>
                    {img.position} – {positionLabel(img.position)}
                  </td>
                  <td>{img.isDate ? "Yes" : "No"}</td>
                  <td>{img.showOnDate || "-"}</td>
                  <td>{new Date(img.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleDelete(img)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
