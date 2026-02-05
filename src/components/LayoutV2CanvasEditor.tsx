/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useCallback, useEffect } from "react";

/* =====================================================
   Types
===================================================== */

type LayoutV2CanvasEditorProps = {
  layout: any;
  imageUrl: string; // image OR video
  onChange: (v: any) => void;
  isVideo: boolean;
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
        zIndex: 0,
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
  isVideo,
}: LayoutV2CanvasEditorProps) {
  /* Preview-only zoom */
  const [canvasScale, setCanvasScale] = useState(1);

  /* Drag refs */
  const draggingRef = useRef<DragState | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  /* Video refs */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoUnlockedRef = useRef(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVideo || !videoContainerRef.current || videoRef.current) return;

    const video = document.createElement("video");
    video.src = imageUrl;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";

    video.style.position = "absolute";
    video.style.inset = "0";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    video.style.background = "#111";

    // 🔑 THESE TWO LINES FIX EVERYTHING
    video.style.zIndex = "0";
    video.style.pointerEvents = "none";

    videoRef.current = video;
    videoContainerRef.current.appendChild(video);
  }, [isVideo, imageUrl]);




  // const isVideo = /\.(mp4|webm|ogg)$/i.test(imageUrl);
  // console.log("is vide o ", isVideo, imageUrl)

  /* =====================================================
     Drag Logic (UNCHANGED)
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
     Video Unlock (USER GESTURE)
  ===================================================== */

  const unlockVideo = () => {
    if (!isVideo) return;
    if (videoUnlockedRef.current) return;

    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.play().catch(() => { });
    videoUnlockedRef.current = true;
  };

  /* =====================================================
     Size Controls (UNCHANGED)
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

      {/* ---------- CONTROLS (PRESERVED) ---------- */}
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
            max={1000}
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
        onMouseDown={unlockVideo}
        style={{
          position: "relative",
          width: canvasWidth,
          height: canvasHeight,
          border: "2px solid #999",
          overflow: "hidden",
          background: "#111",
          userSelect: "none",
        }}
      >
        {/* BACKGROUND */}
        {/* {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={imageUrl}
              muted
              loop
              playsInline
              preload="auto"
              style={{
                position: "absolute",
                inset: 0,
                width: canvasWidth,
                height: canvasHeight,
                objectFit: "contain",
                zIndex: 0,
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.01)",
                zIndex: 1,
              }}
            />
          </>
        ) : (
          <CanvasImage
            imageUrl={imageUrl}
            width={canvasWidth}
            height={canvasHeight}
          />
        )} */}

        {/* BACKGROUND */}
        {isVideo ? (
          <div
            ref={videoContainerRef}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
            }}
          />
        ) : (
          <CanvasImage
            imageUrl={imageUrl}
            width={canvasWidth}
            height={canvasHeight}
          />
        )}


        {/* PROFILE LAYER (UNCHANGED) */}
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
            zIndex: 2,
          }}
        />

        {/* NAME LAYER (UNCHANGED) */}
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
        👉 For videos, click or drag once to start playback.
        All controls work the same as images.
      </small>
    </div>
  );
}
