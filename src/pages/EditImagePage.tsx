/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  fetchImageById,
  updateImageLayout,
  type Image,
} from "../api";

import { LayoutV2CanvasEditor } from "../components/LayoutV2CanvasEditor";

import { convertLayoutToCenter, reverseLayoutToCenter } from "../utils";
import { AnimationEditor, LayoutV2Editor } from "./ImagesPage";

/* -------------------------------------------------
   Fallback layout if backend sends null
-------------------------------------------------- */
const EMPTY_LAYOUT = {
  profile_layer: {
    x: 100,
    y: 100,
    size: 160,
    shape: "circle",
    border: { enabled: false, color: "#FFFFFF", width: 4 },
  },
  name_layer: {
    x: 100,
    y: 100,
    max_width: 600,
    text_size: 42,
    color: "#FFFFFF",
    align: "center",
    font: "poppins_semi_bold",
    shadow: {
      enabled: false,
      dx: 0,
      dy: 2,
      blur: 6,
      color: "#000000",
    },
  },
  profile_anims: [],
  name_anims: [],
  design_width: 1080,
  design_height: 1080,
  video_duration: 5000,
};

export function EditImagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [media, setMedia] = useState<Image | null>(null);
  const [layout, setLayout] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------
     Load media + layout
  -------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!id) return;
        const res = await fetchImageById(id);
        console.log("res ", res)
        setMedia(res);
        const layout2 = reverseLayoutToCenter(res.layout ?? EMPTY_LAYOUT)
        setLayout(layout2);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  /* -------------------------------------------------
     Save Layout
  -------------------------------------------------- */
  async function handleSave() {
    if (!id || !layout) return;

    try {
      setSaving(true);
      const layoutForPost = convertLayoutToCenter(layout)
      await updateImageLayout(id, layoutForPost);

      alert("Layout updated successfully ✅");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  /* -------------------------------------------------
     UI States
  -------------------------------------------------- */
  if (loading) return <p>Loading media...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!media || !layout) return <p>Media not found</p>;

  const mediaUrl = media.imageUrl || media.videoUrl || "";
  const isVideo = media?.mediaType === "video";

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div>
      <h1>Edit Media Layout</h1>

      <button onClick={() => navigate("/images")}>
        ← Back To List
      </button>

      {/* ---------- CANVAS ---------- */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          marginBottom: 20,
          background: "#fafafa",
        }}
      >
        <LayoutV2CanvasEditor
          layout={layout}
          imageUrl={mediaUrl}
          onChange={setLayout}
          isVideo={isVideo}
        />
      </div>

      {/* ---------- LAYOUT EDITOR ---------- */}
      <LayoutV2Editor
        value={layout}
        onChange={setLayout}
      />

      {/* ---------- ANIMATION EDITORS ---------- */}
      {isVideo && (
        <>
          <AnimationEditor
            title="Profile Animations"
            value={layout.profile_anims || []}
            onChange={(v) =>
              setLayout({ ...layout, profile_anims: v })
            }
          />

          <AnimationEditor
            title="Name Animations"
            value={layout.name_anims || []}
            onChange={(v) =>
              setLayout({ ...layout, name_anims: v })
            }
          />
        </>
      )}

      {/* ---------- SAVE ---------- */}
      <div style={{ marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Layout"}
        </button>
      </div>
    </div>
  );
}
