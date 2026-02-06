import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

import {
  fetchImagesAdmin,
  updateTrending,
  fetchCategories,
  fetchLanguages,
  type Image,
  type Category,
} from "../api";

const PAGE_SIZE = 20;

export function ImagesListPage() {
  // const navigate = useNavigate();
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState<number>(-1);

  const [category, setCategory] = useState<string>("");
  const [language, setLanguage] = useState<string>("");

  // -------------------------
  // Load categories + languages
  // -------------------------
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [cats, langs] = await Promise.all([
          fetchCategories(),
          fetchLanguages(),
        ]);
        setCategories(cats);
        setLanguages(langs);
      } catch (e) {
        console.error(e);
      }
    };
    loadFilters();
  }, []);

  // -------------------------
  // Fetch images
  // -------------------------
  async function loadImages(newOffset: number) {
    setLoading(true);
    try {
      const res = await fetchImagesAdmin({
        category: category || undefined,
        language: language || undefined,
        limit: PAGE_SIZE,
        offset: newOffset,
      });

      setImages(res.images);
      setNextOffset(res.next);
      setOffset(newOffset);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadImages(0);
  }, []);

  // -------------------------
  // Actions
  // -------------------------
  async function toggleTrending(img: Image) {
    await updateTrending(img.id, !img.isTrending);
    loadImages(offset);
  }

  function applyFilters() {
    loadImages(0); // reset pagination
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <div>
      <h1>Images</h1>

      {/* Filters */}
      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.key}
            </option>
          ))}
        </select>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">All Languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <button onClick={applyFilters} disabled={loading}>
          Apply
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* Table */}
      <table className="images-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Category</th>
            <th>Lang</th>
            <th>Type</th>
            <th>Version</th>
            <th>Created</th>
            <th>Trending</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => (
            <tr key={img.id}>
              <td>
                {img.mediaType === "video" ? (
                  <video width={80} src={img.videoUrl || ""} />
                ) : (
                  <img src={img.imageUrl} width={80} />
                )}
              </td>
              <td>{img.category}</td>
              <td>{img.language}</td>
              <td>{img.mediaType}</td>
              <td>{img.version}</td>
              <td>{new Date(img.createdAt).toLocaleString()}</td>
              <td>
                <input
                  type="checkbox"
                  checked={img.isTrending}
                  disabled={loading}
                  onChange={() => toggleTrending(img)}
                />
              </td>
              {/* <button onClick={() => navigate(`/images/${img.id}/edit`)}>
                Edit
              </button> */}

              <a
                href={`/images/${img.id}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Edit
              </a>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: 16 }}>
        <button
          disabled={offset === 0 || loading}
          onClick={() => loadImages(Math.max(0, offset - PAGE_SIZE))}
        >
          Prev
        </button>

        <button
          disabled={nextOffset === -1 || loading}
          onClick={() => loadImages(nextOffset)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
