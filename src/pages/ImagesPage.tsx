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
  type Category,
} from "../api";
import { positionLabel } from "../position";
import { PositionGuide } from "../components/PositionGuide";

export function ImagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");

  // Upload form state
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

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
        // setFormCategory(cats[0] || "");
        setFormCategory(cats[0]?.key || "");

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
    if (!window.confirm("Delete this media?")) return;
    try {
      await deleteImage(img.id);
      await reloadImages();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
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
        thumbnail, // optional now
        mediaType,
        category: formCategory,
        language: formLanguage,
        position,
        isDate,
        showOnDate: isDate && showOnDate ? showOnDate : null,
      });

      // Reset form
      setFile(null);
      setThumbnail(null);
      setShowOnDate("");
      (e.target as HTMLFormElement).reset();

      await reloadImages();
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div>
      <h1>Images / Videos</h1>

      {/* ---------------- FILTERS ---------------- */}
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
                <option key={c.key} value={c.key}>
                  {c.labels?.en ?? c.key}
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

      {/* ---------------- UPLOAD ---------------- */}
      <section className="upload-section">
        <h2>Upload New Media</h2>

        <form onSubmit={handleUpload} className="upload-form">
          <label>
            Media Type:
            <select
              value={mediaType}
              onChange={(e) =>
                setMediaType(e.target.value as "image" | "video")
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label>
            File:
            <input
              type="file"
              accept={mediaType === "image" ? "image/*" : "video/*"}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          {mediaType === "video" && (
            <label>
              Thumbnail (optional):
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files?.[0] || null)
                }
              />
              <small>If not provided, thumbnail will be auto-generated.</small>
            </label>
          )}


          <label>
            Category:
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.labels?.en ?? c.key}
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

      {/* ---------------- LIST ---------------- */}
      <section className="image-list">
        <h2>Media List</h2>

        {loading && <p>Loading…</p>}
        {!loading && images.length === 0 && <p>No media found.</p>}

        {!loading && images.length > 0 && (
          <table className="image-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Type</th>
                <th>Category</th>
                <th>Language</th>
                <th>Position</th>
                <th>Date?</th>
                <th>Show On</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {images.map((img) => (
                <tr key={img.id}>
                  <td>
                    {img.mediaType === "image" ? (
                      <img
                        src={img.imageUrl}
                        alt=""
                        style={{ maxWidth: 80, maxHeight: 80 }}
                      />
                    ) : (
                      <video
                        src={img.videoUrl ?? ""}
                        poster={img.imageUrl}
                        style={{ maxWidth: 120, maxHeight: 80 }}
                        muted
                      />
                    )}
                  </td>

                  <td>{img.mediaType === "video" ? "🎥 Video" : "🖼 Image"}</td>
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
