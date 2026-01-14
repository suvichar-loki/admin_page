/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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

/* =====================================================
   Layout V2 Editor (INLINE, SIMPLE, EDITABLE)
===================================================== */
function LayoutV2Editor({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const update = (path: string[], val: any) => {
    const copy = structuredClone(value);
    let ref = copy;
    for (let i = 0; i < path.length - 1; i++) {
      ref = ref[path[i]];
    }
    ref[path[path.length - 1]] = val;
    onChange(copy);
  };

  return (
    <div className="layout-editor">
      <h3>Canvas Layout (V2)</h3>

      <fieldset>
        <legend>Profile Layer</legend>

        <label>
          X:
          <input
            type="number"
            value={value.profile_layer.x}
            onChange={(e) =>
              update(["profile_layer", "x"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Y:
          <input
            type="number"
            value={value.profile_layer.y}
            onChange={(e) =>
              update(["profile_layer", "y"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Size:
          <input
            type="number"
            value={value.profile_layer.size}
            onChange={(e) =>
              update(["profile_layer", "size"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Shape:
          <select
            value={value.profile_layer.shape}
            onChange={(e) =>
              update(["profile_layer", "shape"], e.target.value)
            }
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
          </select>
        </label>

        <label>
          Border Enabled:
          <input
            type="checkbox"
            checked={value.profile_layer.border.enabled}
            onChange={(e) =>
              update(
                ["profile_layer", "border", "enabled"],
                e.target.checked
              )
            }
          />
        </label>

        <label>
          Border Color:
          <input
            type="color"
            value={value.profile_layer.border.color}
            onChange={(e) =>
              update(["profile_layer", "border", "color"], e.target.value)
            }
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Name Layer</legend>

        <label>
          X:
          <input
            type="number"
            value={value.name_layer.x}
            onChange={(e) =>
              update(["name_layer", "x"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Y:
          <input
            type="number"
            value={value.name_layer.y}
            onChange={(e) =>
              update(["name_layer", "y"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Text Size:
          <input
            type="number"
            value={value.name_layer.text_size}
            onChange={(e) =>
              update(["name_layer", "text_size"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Align:
          <select
            value={value.name_layer.align}
            onChange={(e) =>
              update(["name_layer", "align"], e.target.value)
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Design Canvas</legend>

        <label>
          Width:
          <input
            type="number"
            value={value.design_width}
            onChange={(e) =>
              update(["design_width"], Number(e.target.value))
            }
          />
        </label>

        <label>
          Height:
          <input
            type="number"
            value={value.design_height}
            onChange={(e) =>
              update(["design_height"], Number(e.target.value))
            }
          />
        </label>
      </fieldset>
    </div>
  );
}

/* =====================================================
   MAIN PAGE
===================================================== */
export function ImagesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");

  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [formCategory, setFormCategory] = useState("");
  const [formLanguage, setFormLanguage] = useState("");

  const [version, setVersion] = useState<"v1" | "v2">("v1");
  const [position, setPosition] = useState(8);

  const [isDate, setIsDate] = useState(false);
  const [showOnDate, setShowOnDate] = useState("");

  // ---------- V2 Layout State ----------
  const [layoutV2, setLayoutV2] = useState<any>({
    profile_layer: {
      x: 540,
      y: 820,
      size: 160,
      shape: "circle",
      border: { enabled: true, color: "#FFFFFF", width: 4 },
    },
    name_layer: {
      x: 540,
      y: 930,
      max_width: 600,
      text_size: 42,
      color: "#FFFFFF",
      align: "center",
      font: "poppins_semi_bold",
      shadow: {
        enabled: true,
        dx: 0,
        dy: 2,
        blur: 6,
        color: "#000000",
      },
    },
    design_width: 1080,
    design_height: 1080,
  });

  // ---------- Load ----------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cats, langs] = await Promise.all([
          fetchCategories(),
          fetchLanguages(),
        ]);
        setCategories(cats);
        setLanguages(langs);
        setFormCategory(cats[0]?.key || "");
        setFormLanguage(langs[0] || "");
        setImages(await fetchImages({}));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reloadImages = async () => {
    setLoading(true);
    try {
      setImages(
        await fetchImages({
          category: filterCategory || undefined,
          language: filterLanguage || undefined,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Select file");

    setUploading(true);
    try {
      await uploadImage({
        file,
        thumbnail,
        mediaType,
        category: formCategory,
        language: formLanguage,
        version,
        position: version === "v1" ? position : undefined,
        layout: version === "v2" ? layoutV2 : undefined,
        isDate,
        showOnDate: isDate ? showOnDate : null,
      });
      await reloadImages();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Images / Videos</h1>

      <section className="upload-section">
        <h2>Upload New Media</h2>

        <form onSubmit={handleUpload} className="upload-form">
          <label>
            Media Type:
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value as any)}>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label>
            File:
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <label>
            Category:
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.key}</option>
              ))}
            </select>
          </label>

          <label>
            Language:
            <select value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)}>
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>

          <label>
            Layout Version:
            <select value={version} onChange={(e) => setVersion(e.target.value as any)}>
              <option value="v1">V1 – Position</option>
              <option value="v2">V2 – Canvas</option>
            </select>
          </label>

          {version === "v1" && (
            <label>
              Position:
              <select value={position} onChange={(e) => setPosition(+e.target.value)}>
                {[1,2,3,4,5,6,7,8].map(p => (
                  <option key={p} value={p}>{p} – {positionLabel(p)}</option>
                ))}
              </select>
            </label>
          )}

          {version === "v2" && (
            <LayoutV2Editor value={layoutV2} onChange={setLayoutV2} />
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

        {version === "v1" && <PositionGuide />}
      </section>
    </div>
  );
}
