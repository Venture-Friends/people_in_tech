"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquarePlus,
  MapPin,
  Pencil,
  Undo2,
  Trash2,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "pin" | "draw";
type State = "idle" | "annotate" | "submitting";

interface Pin {
  x: number;
  y: number;
  comment: string;
}

interface Stroke {
  points: [number, number][];
  color: string;
}

type Annotation = { type: "pin"; pin: Pin } | { type: "stroke"; stroke: Stroke };

export function FeedbackWidget() {
  if (process.env.NODE_ENV !== "development") return null;

  return <FeedbackWidgetInner />;
}

function FeedbackWidgetInner() {
  const [state, setState] = useState<State>("idle");
  const [mode, setMode] = useState<Mode>("pin");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingPinIndex, setEditingPinIndex] = useState<number | null>(null);
  const [pinComment, setPinComment] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");

  const svgRef = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDrawing = useRef(false);
  const currentStrokePoints = useRef<[number, number][]>([]);
  const [liveStroke, setLiveStroke] = useState<[number, number][] | null>(null);

  const pins = annotations.filter((a): a is { type: "pin"; pin: Pin } => a.type === "pin");
  const strokes = annotations.filter(
    (a): a is { type: "stroke"; stroke: Stroke } => a.type === "stroke"
  );

  useEffect(() => {
    if (editingPinIndex !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingPinIndex]);

  // Lock body scroll when annotating
  useEffect(() => {
    if (state === "annotate") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [state]);

  const handleActivate = () => {
    setState("annotate");
  };

  const getPos = (e: React.MouseEvent): [number, number] => {
    return [e.clientX, e.clientY];
  };

  const findPinAtPos = (x: number, y: number): number | null => {
    // Check if click is within 20px of an existing pin (check in reverse so topmost pin wins)
    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i];
      if (a.type === "pin") {
        const dx = a.pin.x - x;
        const dy = a.pin.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= 20) return i;
      }
    }
    return null;
  };

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    const [x, y] = getPos(e);

    // If currently editing a pin comment, submit it first
    if (editingPinIndex !== null) {
      handlePinCommentSubmit();
      return;
    }

    if (mode === "pin") {
      // Check if clicking on an existing pin to edit it
      const existingIdx = findPinAtPos(x, y);
      if (existingIdx !== null) {
        const a = annotations[existingIdx];
        if (a.type === "pin") {
          setEditingPinIndex(existingIdx);
          setPinComment(a.pin.comment);
        }
        return;
      }

      // Place a new pin
      const newPin: Pin = { x, y, comment: "" };
      setAnnotations((prev) => [...prev, { type: "pin", pin: newPin }]);
      setEditingPinIndex(annotations.length);
      setPinComment("");
    } else {
      isDrawing.current = true;
      currentStrokePoints.current = [[x, y]];
      setLiveStroke([[x, y]]);
    }
  };

  const handleOverlayMouseMove = (e: React.MouseEvent) => {
    if (mode !== "draw" || !isDrawing.current) return;
    const [x, y] = getPos(e);
    currentStrokePoints.current.push([x, y]);
    setLiveStroke([...currentStrokePoints.current]);
  };

  const handleOverlayMouseUp = () => {
    if (mode !== "draw" || !isDrawing.current) return;
    isDrawing.current = false;
    if (currentStrokePoints.current.length >= 2) {
      setAnnotations((prev) => [
        ...prev,
        {
          type: "stroke",
          stroke: {
            points: [...currentStrokePoints.current],
            color: "#ef4444",
          },
        },
      ]);
    }
    currentStrokePoints.current = [];
    setLiveStroke(null);
  };

  const handlePinCommentSubmit = () => {
    if (editingPinIndex === null) return;
    setAnnotations((prev) =>
      prev.map((a, i) =>
        i === editingPinIndex && a.type === "pin"
          ? { ...a, pin: { ...a.pin, comment: pinComment } }
          : a
      )
    );
    setEditingPinIndex(null);
    setPinComment("");
  };

  const handleUndo = () => {
    setAnnotations((prev) => prev.slice(0, -1));
    setEditingPinIndex(null);
  };

  const handleClear = () => {
    setAnnotations([]);
    setEditingPinIndex(null);
  };

  const handleCancel = () => {
    setAnnotations([]);
    setEditingPinIndex(null);
    setFeedbackComment("");
    setState("idle");
  };

  const handleSubmit = async () => {
    setState("submitting");
    try {
      // Build annotated screenshot by rendering annotations onto a canvas
      const w = window.innerWidth;
      const h = window.innerHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      // Fill with a snapshot of current viewport color (best-effort background)
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // Render the SVG annotations onto the canvas
      if (svgRef.current) {
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("SVG render failed"));
          img.src = url;
        });
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });

      const meta = {
        pageUrl: window.location.pathname,
        comment: feedbackComment,
        pins: pins.map((a) => a.pin),
        drawings: strokes.map((a) => a.stroke),
        timestamp: new Date().toISOString(),
        viewport: { width: w, height: h },
        scrollPosition: { x: window.scrollX, y: window.scrollY },
      };

      const formData = new FormData();
      formData.append("screenshot", blob, "screenshot.png");
      formData.append("meta", JSON.stringify(meta));

      const res = await fetch("/api/feedback", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        toast.success("Feedback saved");
      } else {
        toast.error("Failed to save feedback");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Failed to save feedback");
    } finally {
      setAnnotations([]);
      setEditingPinIndex(null);
      setFeedbackComment("");
      setState("idle");
    }
  };

  const pointsToPath = (points: [number, number][]) => {
    if (points.length < 2) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  };

  if (state === "idle") {
    return (
      <button
        onClick={handleActivate}
        data-feedback-widget
        className={cn(
          "fixed bottom-6 right-6 z-[9999] flex h-12 w-12 items-center justify-center",
          "rounded-full bg-card border border-border shadow-lg",
          "hover:bg-accent transition-colors cursor-pointer",
          "text-muted-foreground hover:text-foreground"
        )}
        title="Send feedback"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>
    );
  }

  // Annotation overlay — renders on top of the live page
  return (
    <>
      {/* Transparent overlay for capturing mouse events */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ cursor: mode === "pin" ? "crosshair" : "default" }}
        onMouseDown={handleOverlayMouseDown}
        onMouseMove={handleOverlayMouseMove}
        onMouseUp={handleOverlayMouseUp}
        onMouseLeave={handleOverlayMouseUp}
      >
        {/* SVG layer for rendering annotations */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${typeof window !== "undefined" ? window.innerWidth : 1920} ${typeof window !== "undefined" ? window.innerHeight : 1080}`}
        >
          {/* Subtle border to show annotation mode is active */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeDasharray="8 4"
          />

          {/* Strokes */}
          {strokes.map((a, i) => (
            <path
              key={`stroke-${i}`}
              d={pointsToPath(a.stroke.points)}
              fill="none"
              stroke={a.stroke.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Live drawing stroke */}
          {liveStroke && liveStroke.length >= 2 && (
            <path
              d={pointsToPath(liveStroke)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          )}

          {/* Pins */}
          {pins.map((a, i) => {
            const pinNum = i + 1;
            const hasComment = !!a.pin.comment;
            // Truncate long comments for the label
            const label = a.pin.comment.length > 30
              ? a.pin.comment.slice(0, 30) + "..."
              : a.pin.comment;
            return (
              <g key={`pin-${i}`} style={{ cursor: "pointer" }}>
                {/* Pulse ring for pins without comments */}
                {!hasComment && (
                  <circle
                    cx={a.pin.x}
                    cy={a.pin.y}
                    r="20"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate attributeName="r" from="14" to="24" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={a.pin.x} cy={a.pin.y} r="14" fill={hasComment ? "#22c55e" : "#ef4444"} />
                <circle
                  cx={a.pin.x}
                  cy={a.pin.y}
                  r="14"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={a.pin.x}
                  y={a.pin.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {pinNum}
                </text>
                {hasComment && (
                  <>
                    <rect
                      x={a.pin.x + 20}
                      y={a.pin.y - 14}
                      width={label.length * 7.2 + 16}
                      height="24"
                      rx="4"
                      fill="rgba(0,0,0,0.85)"
                    />
                    <text
                      x={a.pin.x + 28}
                      y={a.pin.y - 1}
                      fill="#ffffff"
                      fontSize="13"
                      fontFamily="system-ui, sans-serif"
                      dominantBaseline="central"
                    >
                      {label}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom toolbar — placed at bottom so it doesn't block navbar for pin placement */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur border-t border-white/10">
        <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
          <button
            onClick={() => setMode("pin")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "pin"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white/80"
            )}
          >
            <MapPin className="h-4 w-4" />
            Pin
          </button>
          <button
            onClick={() => setMode("draw")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "draw"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white/80"
            )}
          >
            <Pencil className="h-4 w-4" />
            Draw
          </button>
        </div>

        <div className="h-5 w-px bg-white/20" />

        <button
          onClick={handleUndo}
          disabled={annotations.length === 0}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/60 hover:text-white/80 disabled:opacity-30 transition-colors"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </button>
        <button
          onClick={handleClear}
          disabled={annotations.length === 0}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/60 hover:text-white/80 disabled:opacity-30 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>

        <div className="h-5 w-px bg-white/20" />

        <input
          type="text"
          value={feedbackComment}
          onChange={(e) => setFeedbackComment(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="What's the issue?"
          className="flex-1 min-w-0 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40"
        />

        <button
          onClick={handleSubmit}
          disabled={state === "submitting"}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {state === "submitting" ? "Saving..." : "Submit"}
        </button>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/60 hover:text-white/80 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>

      {/* Pin comment popover */}
      {editingPinIndex !== null && (() => {
        const a = annotations[editingPinIndex];
        if (!a || a.type !== "pin") return null;

        // Position the popover, clamping so it doesn't overflow the viewport
        const popoverWidth = 280;
        const popoverHeight = 120;
        let left = a.pin.x + 24;
        let top = a.pin.y - 20;
        if (typeof window !== "undefined") {
          if (left + popoverWidth > window.innerWidth - 16) left = a.pin.x - popoverWidth - 8;
          if (top + popoverHeight > window.innerHeight - 16) top = window.innerHeight - popoverHeight - 16;
          if (top < 50) top = 50;
        }

        const pinNum = annotations
          .slice(0, editingPinIndex + 1)
          .filter((ann) => ann.type === "pin").length;

        return (
          <div
            className="fixed z-[102] flex flex-col gap-2 rounded-lg border border-white/20 bg-black/90 p-3 shadow-xl backdrop-blur"
            style={{ left, top, width: popoverWidth }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/60">Pin #{pinNum}</span>
              <button
                onClick={() => {
                  // Delete this pin
                  setAnnotations((prev) => prev.filter((_, i) => i !== editingPinIndex));
                  setEditingPinIndex(null);
                  setPinComment("");
                }}
                className="text-white/40 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
              value={pinComment}
              onChange={(e) => setPinComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePinCommentSubmit();
                }
                if (e.key === "Escape") handlePinCommentSubmit();
              }}
              placeholder="Describe the issue here..."
              rows={3}
              className="w-full resize-none rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40"
            />
            <button
              onClick={handlePinCommentSubmit}
              className="self-end rounded-md bg-white/20 px-3 py-1 text-xs font-medium text-white hover:bg-white/30 transition-colors"
            >
              Done
            </button>
          </div>
        );
      })()}
    </>
  );
}
