/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useCallback } from "react";

/* =====================================================
   Types
===================================================== */

type LayoutV2CanvasEditorProps = {
  layout: any;
  imageUrl: string;
  onChange: (v: any) => void;
};

type DragState = {
  layer: "profile" | "name";
  startX: number;
  startY: number;
  origX: number;
  origY: number;
};

/* =====================================================
   Static Image Layer (NO FLICKER)
===================================================== */

const CanvasImage = React.memo(function CanvasImage({
  imageUrl,
  width,
  height,
}: {
  imageUrl: string;
  width: number;
  height: number;
}) {
  return (
    <img
      src={imageUrl}
      draggable={false}
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        objectFit: "contain",
        backgroundColor: "#111",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
});

/* =====================================================
   Main Editor
===================================================== */

export function LayoutV2CanvasEditor({
  layout,
  imageUrl,
  onChange,
}: LayoutV2CanvasEditorProps) {
  /* Preview-only zoom */
  const [canvasScale, setCanvasScale] = useState(1);

  /* Drag refs */
  const draggingRef = useRef<DragState | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     Drag Logic (NO React updates during drag)
  ===================================================== */

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

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;

      const { layer, startX, startY } = draggingRef.current;

      const dx = (e.clientX - startX) / canvasScale;
      const dy = (e.clientY - startY) / canvasScale;

      const el =
        layer === "profile"
          ? profileRef.current
          : nameRef.current;

      if (!el) return;

      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [canvasScale]
  );

  const stopDrag = useCallback(() => {
    if (!draggingRef.current) return;

    const { layer, origX, origY } = draggingRef.current;

    const el =
      layer === "profile"
        ? profileRef.current
        : nameRef.current;

    if (el) {
      const match = el.style.transform.match(
        /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/
      );

      if (match) {
        const dx = Number(match[1]);
        const dy = Number(match[2]);

        const updated = structuredClone(layout);

        if (layer === "profile") {
          updated.profile_layer.x = Math.round(origX + dx);
          updated.profile_layer.y = Math.round(origY + dy);
        } else {
          updated.name_layer.x = Math.round(origX + dx);
          updated.name_layer.y = Math.round(origY + dy);
        }

        onChange(updated);
      }

      el.style.transform = "";
    }

    draggingRef.current = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
  }, [layout, onChange, onDrag]);

  /* =====================================================
     Size Controls (Intentional React updates)
  ===================================================== */

  const updateProfileSize = (size: number) => {
    const updated = structuredClone(layout);
    updated.profile_layer.size = size;
    onChange(updated);
  };

  const updateNameSize = (size: number) => {
    const updated = structuredClone(layout);
    updated.name_layer.text_size = size;
    onChange(updated);
  };

  const profileSize = layout.profile_layer.size;

  const canvasWidth = layout.design_width * canvasScale;
  const canvasHeight = layout.design_height * canvasScale;

  /* =====================================================
     Render
  ===================================================== */

  return (
    <div style={{ marginBottom: 24 }}>
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
        <label>
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

        <label>
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

        <label>
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
          width: canvasWidth,
          height: canvasHeight,
          border: "2px solid #999",
          overflow: "hidden",
          userSelect: "none",
          background: "#111",
          contain: "layout paint size",
        }}
      >
        {/* STATIC IMAGE (NO FLICKER EVER) */}
        <CanvasImage
          imageUrl={imageUrl}
          width={canvasWidth}
          height={canvasHeight}
        />

        {/* PROFILE LAYER */}
        <div
          ref={profileRef}
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
            boxSizing: "border-box",
            cursor: "move",
            willChange: "transform",
            zIndex: 2,
          }}
        />

        {/* NAME LAYER */}
        <div
          ref={nameRef}
          onMouseDown={(e) => startDrag(e, "name")}
          style={{
            position: "absolute",
            left: layout.name_layer.x * canvasScale,
            top: layout.name_layer.y * canvasScale,
            fontSize: layout.name_layer.text_size * canvasScale,
            color: layout.name_layer.color,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "move",
            willChange: "transform",
            zIndex: 3,
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
        👉 Canvas zoom is preview-only. Layout values remain
        canonical.
      </small>
    </div>
  );
}
