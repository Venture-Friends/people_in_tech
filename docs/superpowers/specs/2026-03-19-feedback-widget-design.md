# Feedback Widget — Design Spec

**Date**: 2026-03-19
**Status**: Approved
**Purpose**: Dev-only visual feedback tool embedded in the website for annotating pages with pins and freehand drawings, capturing screenshots, and saving structured feedback for Claude to process.

---

## Overview

A floating feedback button appears on every page in development mode. When clicked, it captures a screenshot of the current page using `html2canvas`, presents it as a full-screen canvas overlay, and lets the user annotate with click-to-pin markers and freehand drawing. Each submission saves an annotated screenshot PNG and a JSON metadata file to a local `feedback/` directory.

## Component Architecture

### FeedbackWidget

- **Location**: `/src/components/shared/feedback-widget.tsx`
- **Type**: Client component (`"use client"`)
- **Placement**: Rendered in `/src/app/[locale]/layout.tsx` after the `Toaster` component
- **Visibility**: Dev-only — renders nothing when `process.env.NODE_ENV !== "development"`

### States

1. **Idle** — floating button visible (bottom-right corner)
2. **Capture** — `html2canvas` captures the page, screenshot displayed as full-screen canvas overlay
3. **Annotate** — user pins and/or draws on the canvas, adds comments
4. **Submit** — annotations burned into screenshot, saved via API, toast shown, return to idle

## UI Details

### Floating Button
- Position: bottom-right, fixed, `z-50`
- Icon: Lucide `MessageSquarePlus`
- Style: `bg-card border-border`, circular, matches dark theme

### Overlay (Annotate State)
- Full-screen overlay (`z-50`) with captured screenshot as canvas background
- Top toolbar (dark translucent bar):
  - Mode toggle: **Pin** / **Draw** (Pin is default)
  - Undo button (removes last annotation)
  - Clear button (removes all annotations)
  - Submit button (saves feedback)
  - Cancel button (discards, returns to idle)

### Pin Mode
- Click anywhere on the canvas to drop a numbered marker (1, 2, 3...)
- Small popup text input appears next to the pin
- Press Enter or click away to confirm the comment
- Pins are rendered as numbered circles with a comment label

### Draw Mode
- Freehand drawing on the canvas via mouse/touch events
- Red stroke (`#ff0000`), 3px width
- Each continuous stroke is one undo-able unit

### Submit Flow
1. Burn all annotations (pins, drawings, pin labels) into the canvas
2. Export canvas as PNG blob
3. POST to `/api/feedback` with PNG + metadata
4. Show toast: "Feedback #N saved" (via Sonner)
5. Return to idle state

### Cancel
- Discard all annotations
- Return to idle state

## API Route

**Path**: `/src/app/api/feedback/route.ts`

### POST /api/feedback
- Accepts: `multipart/form-data` with `screenshot` (PNG file) and `meta` (JSON string)
- Creates a numbered directory under `feedback/` at project root
- Saves `screenshot.png` and `meta.json`
- Returns: `{ success: true, id: number }`

### GET /api/feedback
- Returns: array of all feedback items (metadata only, screenshot paths included)
- Sorted by timestamp ascending

## Data Model

### Directory Structure
```
feedback/                          # gitignored
  001-1710842400000/
    screenshot.png                 # annotated screenshot
    meta.json                      # metadata
  002-1710842500000/
    screenshot.png
    meta.json
```

### meta.json
```json
{
  "id": 1,
  "pageUrl": "/en/discover",
  "comment": "",
  "pins": [
    { "x": 450, "y": 320, "comment": "Make this bigger" }
  ],
  "drawings": [
    { "points": [[100, 200], [105, 202]], "color": "#ff0000" }
  ],
  "timestamp": "2026-03-19T14:30:00.000Z",
  "viewport": { "width": 1920, "height": 1080 }
}
```

## Dependencies

### New
- `html2canvas` — screenshot capture (~40KB)

### Existing (no additions needed)
- `lucide-react` — icons
- `sonner` — toast notifications
- `tailwindcss` — styling
- `cn()` from `@/lib/utils` — class merging

## Scope Boundaries

- Dev-only: no production build impact
- No database involvement — filesystem storage only
- No authentication required — dev tool
- No i18n needed — English-only dev tool
- No tests — throwaway dev utility
- Widget should be removable by deleting the component and its layout import

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/shared/feedback-widget.tsx` | Create — main widget component |
| `src/app/api/feedback/route.ts` | Create — API route for saving/listing feedback |
| `src/app/[locale]/layout.tsx` | Modify — add `<FeedbackWidget />` |
| `.gitignore` | Modify — add `feedback/` |
| `package.json` | Modify — add `html2canvas` dependency |
