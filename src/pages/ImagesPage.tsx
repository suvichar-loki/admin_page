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
import { LayoutV2CanvasEditor } from "../components/LayoutV2CanvasEditor";


function convertLayoutToCenter(layout: any) {
  const size = layout.profile_layer.size;
  const size2 = layout.name_layer.text_size;

  return {
    ...layout,
    profile_layer: {
      ...layout.profile_layer,
      x: Math.round(layout.profile_layer.x + size / 2),
      y: Math.round(layout.profile_layer.y + size / 2)
    },
    name_layer: {
      ...layout.name_layer,
      y: Math.round(layout.name_layer.y + size2)
    },
  };
}


const DEFAULT_LAYOUT = {
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

  // 🔥 NEW (video only)
  profile_anims: [],
  name_anims: [],

  design_width: 1080,
  design_height: 1080,
  video_duration: 5000,
};

/* =====================================================
   Layout V2 Editor (INLINE, COMPLETE, EDITABLE)
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

      {/* ================= PROFILE LAYER ================= */}
      <fieldset>
        <legend>Profile Layer</legend>

        <label>
          X:
          <input
            type="number"
            value={value.profile_layer.x}
            onChange={(e) =>
              update(["profile_layer", "x"], +e.target.value)
            }
          />
        </label>

        <label>
          Y:
          <input
            type="number"
            value={value.profile_layer.y}
            onChange={(e) =>
              update(["profile_layer", "y"], +e.target.value)
            }
          />
        </label>

        <label>
          Size:
          <input
            type="number"
            min={1}
            value={value.profile_layer.size}
            onChange={(e) =>
              update(["profile_layer", "size"], +e.target.value)
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
          Border Width:
          <input
            type="number"
            min={0}
            value={value.profile_layer.border.width}
            onChange={(e) =>
              update(
                ["profile_layer", "border", "width"],
                +e.target.value
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
              update(
                ["profile_layer", "border", "color"],
                e.target.value
              )
            }
          />
        </label>
      </fieldset>

      {/* ================= NAME LAYER ================= */}
      <fieldset>
        <legend>Name Layer</legend>

        <label>
          X:
          <input
            type="number"
            value={value.name_layer.x}
            onChange={(e) =>
              update(["name_layer", "x"], +e.target.value)
            }
          />
        </label>

        <label>
          Y:
          <input
            type="number"
            value={value.name_layer.y}
            onChange={(e) =>
              update(["name_layer", "y"], +e.target.value)
            }
          />
        </label>

        <label>
          Text Size:
          <input
            type="number"
            min={1}
            value={value.name_layer.text_size}
            onChange={(e) =>
              update(
                ["name_layer", "text_size"],
                +e.target.value
              )
            }
          />
        </label>

        <label>
          Max Width:
          <input
            type="number"
            min={0}
            value={value.name_layer.max_width}
            onChange={(e) =>
              update(
                ["name_layer", "max_width"],
                +e.target.value
              )
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

        <label>
          Text Color:
          <input
            type="color"
            value={value.name_layer.color}
            onChange={(e) =>
              update(["name_layer", "color"], e.target.value)
            }
          />
        </label>

        <label>
          Font:
          <select
            value={value.name_layer.font}
            onChange={(e) =>
              update(["name_layer", "font"], e.target.value)
            }
          >
            <option value="poppins_semi_bold">Poppins Semi Bold</option>
            <option value="poppins_regular">Poppins Regular</option>
            <option value="inter_bold">Inter Bold</option>
          </select>
        </label>

        {/* ---------- Shadow ---------- */}
        <label>
          Shadow Enabled:
          <input
            type="checkbox"
            checked={value.name_layer.shadow.enabled}
            onChange={(e) =>
              update(
                ["name_layer", "shadow", "enabled"],
                e.target.checked
              )
            }
          />
        </label>

        <label>
          Shadow X:
          <input
            type="number"
            value={value.name_layer.shadow.dx}
            onChange={(e) =>
              update(
                ["name_layer", "shadow", "dx"],
                +e.target.value
              )
            }
          />
        </label>

        <label>
          Shadow Y:
          <input
            type="number"
            value={value.name_layer.shadow.dy}
            onChange={(e) =>
              update(
                ["name_layer", "shadow", "dy"],
                +e.target.value
              )
            }
          />
        </label>

        <label>
          Shadow Blur:
          <input
            type="number"
            min={0}
            value={value.name_layer.shadow.blur}
            onChange={(e) =>
              update(
                ["name_layer", "shadow", "blur"],
                +e.target.value
              )
            }
          />
        </label>

        <label>
          Shadow Color:
          <input
            type="color"
            value={value.name_layer.shadow.color}
            onChange={(e) =>
              update(
                ["name_layer", "shadow", "color"],
                e.target.value
              )
            }
          />
        </label>
      </fieldset>

      {/* ================= CANVAS ================= */}
      <fieldset>
        <legend>Design Canvas</legend>

        <label>
          Width:
          <input
            type="number"
            min={1}
            value={value.design_width}
            onChange={(e) =>
              update(["design_width"], +e.target.value)
            }
          />
        </label>

        <label>
          Height:
          <input
            type="number"
            min={1}
            value={value.design_height}
            onChange={(e) =>
              update(["design_height"], +e.target.value)
            }
          />
        </label>
      </fieldset>

      {/* ================= VIDEO ================= */}
      {typeof value.video_duration === "number" && (
        <fieldset>
          <legend>Video Settings</legend>

          <label>
            Video Duration:
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={value.video_duration}
              onChange={(e) =>
                update(
                  ["video_duration"],
                  +e.target.value
                )
              }
            />
          </label>
        </fieldset>
      )}
    </div>
  );
}


function AnimationEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: any[];
  onChange: (v: any[]) => void;
}) {
  const update = (i: number, patch: any) => {
    const copy = structuredClone(value);
    copy[i] = { ...copy[i], ...patch };
    onChange(copy);
  };

  const add = () => {
    onChange([
      ...value,
      {
        start_time: 0,
        duration: 1,
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 },
        opacity: { from: 1, to: 1 },
        easing: "linear",
      },
    ]);
  };

  const remove = (i: number) => {
    const copy = [...value];
    copy.splice(i, 1);
    onChange(copy);
  };

  return (
    <fieldset style={{ marginTop: 16 }}>
      <legend>{title}</legend>

      {value.map((a, i) => (
        <div key={i} style={{ border: "1px solid #ddd", padding: 8, marginBottom: 8 }}>
          <strong>Animation #{i + 1}</strong>

          <label>
            Start Time (s):
            <input
              type="number"
              step="0.1"
              value={a.start_time}
              onChange={(e) => update(i, { start_time: +e.target.value })}
            />
          </label>

          <label>
            Duration (s):
            <input
              type="number"
              step="0.1"
              value={a.duration}
              onChange={(e) => update(i, { duration: +e.target.value })}
            />
          </label>

          <label>
            From X:
            <input
              type="number"
              value={a.from.x}
              onChange={(e) =>
                update(i, { from: { ...a.from, x: +e.target.value } })
              }
            />
          </label>

          <label>
            From Y:
            <input
              type="number"
              value={a.from.y}
              onChange={(e) =>
                update(i, { from: { ...a.from, y: +e.target.value } })
              }
            />
          </label>

          <label>
            To X:
            <input
              type="number"
              value={a.to.x}
              onChange={(e) =>
                update(i, { to: { ...a.to, x: +e.target.value } })
              }
            />
          </label>

          <label>
            To Y:
            <input
              type="number"
              value={a.to.y}
              onChange={(e) =>
                update(i, { to: { ...a.to, y: +e.target.value } })
              }
            />
          </label>

          <label>
            Opacity From:
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={a.opacity.from}
              onChange={(e) =>
                update(i, { opacity: { ...a.opacity, from: +e.target.value } })
              }
            />
          </label>

          <label>
            Opacity To:
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={a.opacity.to}
              onChange={(e) =>
                update(i, { opacity: { ...a.opacity, to: +e.target.value } })
              }
            />
          </label>

          <label>
            Easing:
            <select
              value={a.easing}
              onChange={(e) => update(i, { easing: e.target.value })}
            >
              <option value="linear">Linear</option>
              <option value="ease_in">Ease In</option>
              <option value="ease_out">Ease Out</option>
              <option value="ease_in_out">Ease In Out</option>
            </select>
          </label>

          <button type="button" onClick={() => remove(i)}>
            Remove Animation
          </button>
        </div>
      ))}

      <button type="button" onClick={add}>
        + Add Animation
      </button>
    </fieldset>
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

  const [version, setVersion] = useState<"v1" | "v2">("v2");
  const [position, setPosition] = useState(8);

  const [isDate, setIsDate] = useState(false);
  const [showOnDate, setShowOnDate] = useState("");

  // ---------- V2 Layout State ----------
  const [layoutV2, setLayoutV2] = useState<any>(DEFAULT_LAYOUT);

  const previewUrl = file ? URL.createObjectURL(file) : "";
  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.src = previewUrl;

    img.onload = () => {
      setLayoutV2((prev: any) => ({
        ...prev,
        design_width: img.naturalWidth,
        design_height: img.naturalHeight,
      }));
    };
  }, [previewUrl]);



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
      const layoutForPost = convertLayoutToCenter(layoutV2)

      await uploadImage({
        file,
        thumbnail,
        mediaType,
        category: formCategory,
        language: formLanguage,
        version,
        position: version === "v1" ? position : undefined,
        layout: layoutForPost,
        isDate,
        showOnDate: isDate ? showOnDate : null,
      });

      // setFile(null);
      // setThumbnail(null);
      // setLayoutV2(DEFAULT_LAYOUT);

      // await reloadImages();
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
              <option value="v2">V2 – Canvas</option>
            </select>
          </label>


          {version === "v2" && file && (
            <>
              <div
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  marginBottom: 20,
                  background: "#fafafa",
                }}
              >
                <LayoutV2CanvasEditor
                  layout={layoutV2}
                  imageUrl={previewUrl}
                  onChange={setLayoutV2}
                />
              </div>

              <LayoutV2Editor
                value={layoutV2}
                onChange={setLayoutV2}
              />

              {mediaType === "video" && (
                <>
                  <AnimationEditor
                    title="Profile Animations"
                    value={layoutV2.profile_anims}
                    onChange={(v) =>
                      setLayoutV2({ ...layoutV2, profile_anims: v })
                    }
                  />

                  <AnimationEditor
                    title="Name Animations"
                    value={layoutV2.name_anims}
                    onChange={(v) =>
                      setLayoutV2({ ...layoutV2, name_anims: v })
                    }
                  />
                </>
              )}
            </>
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

      </section>
    </div>
  );
}
