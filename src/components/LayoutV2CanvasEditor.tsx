/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";

type LayoutV2CanvasEditorProps = {
  layout: any;
  imageUrl: string;
  onChange: (v: any) => void;
};

export function LayoutV2CanvasEditor({
  layout,
  imageUrl,
  onChange,
}: LayoutV2CanvasEditorProps) {
  /* 🔥 Canvas preview scale (UI-only) */
  const [canvasScale, setCanvasScale] = useState(1);

  const draggingRef = useRef<{
    layer: "profile" | "name";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  /* ---------------- Drag to Move (scale-aware) ---------------- */

  const startDrag = (
    e: React.MouseEvent,
    layer: "profile" | "name"
  ) => {
    e.preventDefault();

    const target =
      layer === "profile"
        ? layout.profile_layer
        : layout.name_layer;

    draggingRef.current = {
      layer,
      startX: e.clientX,
      startY: e.clientY,
      origX: target.x,
      origY: target.y,
    };

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const onDrag = (e: MouseEvent) => {
    if (!draggingRef.current) return;

    const { layer, startX, startY, origX, origY } =
      draggingRef.current;

    const dx = (e.clientX - startX) / canvasScale;
    const dy = (e.clientY - startY) / canvasScale;

    const updated = structuredClone(layout);

    if (layer === "profile") {
      updated.profile_layer.x = Math.round(origX + dx);
      updated.profile_layer.y = Math.round(origY + dy);
    } else {
      updated.name_layer.x = Math.round(origX + dx);
      updated.name_layer.y = Math.round(origY + dy);
    }

    onChange(updated);
  };

  const stopDrag = () => {
    draggingRef.current = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
  };

  /* ---------------- Profile Size (CANONICAL = size) ---------------- */

  const updateProfileSize = (size: number) => {
    const updated = structuredClone(layout);
    updated.profile_layer.size = size;
    onChange(updated);
  };

  const updateNameSize = (v: number) => {
    const updated = structuredClone(layout);
    updated.name_layer.text_size = v;
    onChange(updated);
  };

  /* 🔑 derive width/height from canonical size */
  const profileSize = layout.profile_layer.size;

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Canvas Preview</h3>

      {/* ---------- CONTROLS ---------- */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginBottom: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Canvas Zoom */}
        <label style={{ fontSize: 14 }}>
          Canvas Zoom&nbsp;
          <strong>{Math.round(canvasScale * 100)}%</strong>
          <input
            type="range"
            min={0.25}
            max={1.5}
            step={0.05}
            value={canvasScale}
            onChange={(e) =>
              setCanvasScale(Number(e.target.value))
            }
          />
        </label>

        {/* ✅ Profile Size (FIXED) */}
        <label style={{ fontSize: 14 }}>
          Profile Size&nbsp;
          <strong>{profileSize}px</strong>
          <input
            type="range"
            min={40}
            max={500}
            step={2}
            value={profileSize}
            onChange={(e) =>
              updateProfileSize(Number(e.target.value))
            }
          />
        </label>

        {/* Name Size */}
        <label style={{ fontSize: 14 }}>
          Name Size&nbsp;
          <strong>{layout.name_layer.text_size}px</strong>
          <input
            type="range"
            min={12}
            max={120}
            step={1}
            value={layout.name_layer.text_size}
            onChange={(e) =>
              updateNameSize(Number(e.target.value))
            }
          />
        </label>
      </div>

      {/* ---------- CANVAS ---------- */}
      <div
        style={{
          position: "relative",
          width: layout.design_width * canvasScale,
          height: layout.design_height * canvasScale,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#111",
          border: "2px solid #999",
          marginBottom: 10,
          userSelect: "none",
        }}
      >
        {/* PROFILE LAYER */}
        <div
          onMouseDown={(e) => startDrag(e, "profile")}
          style={{
            position: "absolute",
            left: layout.profile_layer.x * canvasScale,
            top: layout.profile_layer.y * canvasScale,
            width: profileSize * canvasScale,
            height: profileSize * canvasScale,
            borderRadius:
              layout.profile_layer.shape === "circle"
                ? "50%"
                : "0",
            background: "#ddd",
            border: layout.profile_layer.border.enabled
              ? `${layout.profile_layer.border.width}px solid ${layout.profile_layer.border.color}`
              : "none",
            cursor: "move",
            boxSizing: "border-box",
          }}
        />

        {/* NAME LAYER */}
        <div
          onMouseDown={(e) => startDrag(e, "name")}
          style={{
            position: "absolute",
            left: layout.name_layer.x * canvasScale,
            top: layout.name_layer.y * canvasScale,
            fontSize: layout.name_layer.text_size * canvasScale,
            color: layout.name_layer.color,
            textAlign: layout.name_layer.align,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "move",
            textShadow: layout.name_layer.shadow?.enabled
              ? `${layout.name_layer.shadow.dx}px
                 ${layout.name_layer.shadow.dy}px
                 ${layout.name_layer.shadow.blur}px
                 ${layout.name_layer.shadow.color}`
              : "none",
          }}
        >
          Your Name
        </div>
      </div>

      <small>
        👉 Canvas zoom is preview-only. Layout values stay real.
      </small>
    </div>
  );
}
