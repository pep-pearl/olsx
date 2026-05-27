export const FLOATING_TOOLTIP_STYLE: React.CSSProperties = {
  background: "rgba(17, 24, 39, 0.9)",
  borderRadius: 4,
  color: "#fff",
  fontSize: 12,
  lineHeight: 1.5,
  minWidth: 168,
  padding: "8px 10px",
  pointerEvents: "none",
};

export type DrawingPresetKind = "distance" | "area" | "circle";

export const DRAWING_PRESET_COLORS: Record<
  DrawingPresetKind,
  {
    main: string;
    fill: string;
    sketch: string;
    sketchFill: string;
  }
> = {
  distance: {
    main: "#2563eb",
    fill: "rgba(37, 99, 235, 0.16)",
    sketch: "rgba(37, 99, 235, 0.5)",
    sketchFill: "rgba(37, 99, 235, 0.08)",
  },
  area: {
    main: "#059669",
    fill: "rgba(5, 150, 105, 0.18)",
    sketch: "rgba(5, 150, 105, 0.5)",
    sketchFill: "rgba(5, 150, 105, 0.08)",
  },
  circle: {
    main: "#ea580c",
    fill: "rgba(234, 88, 12, 0.16)",
    sketch: "rgba(234, 88, 12, 0.5)",
    sketchFill: "rgba(234, 88, 12, 0.08)",
  },
};

function encodeCursorSvg(svg: string) {
  return svg
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .replace(/#/g, "%23")
    .trim();
}

function getCursorIcon(kind: DrawingPresetKind, color: string) {
  if (kind === "distance") {
    return `<path d="M13 23 26 10" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/><circle cx="13" cy="23" r="3" fill="white" stroke="${color}" stroke-width="2"/><circle cx="26" cy="10" r="3" fill="white" stroke="${color}" stroke-width="2"/>`;
  }

  if (kind === "area") {
    return `<path d="M14 24 25 22 27 12 18 9 12 16Z" fill="${DRAWING_PRESET_COLORS.area.fill}" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="14" cy="24" r="2.5" fill="white" stroke="${color}" stroke-width="1.8"/>`;
  }

  return `<circle cx="21" cy="18" r="8" fill="${DRAWING_PRESET_COLORS.circle.fill}" stroke="${color}" stroke-width="2.5"/><circle cx="21" cy="18" r="2.5" fill="${color}"/>`;
}

export function getDrawingPresetCursor(kind: DrawingPresetKind) {
  const color = DRAWING_PRESET_COLORS[kind].main;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M3 16V4h12" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 16V4h12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>${getCursorIcon(kind, color)}</svg>`;

  return `url("data:image/svg+xml,${encodeCursorSvg(svg)}") 3 3, crosshair`;
}

export const DONE_TOOLTIP_STYLE: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.16)",
  color: "#111827",
  fontSize: 12,
  lineHeight: 1.6,
  minWidth: 140,
  padding: "10px 12px",
};

export const SEGMENT_LABEL_STYLE: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 3,
  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.16)",
  color: "#ec0061",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1,
  padding: "4px 5px",
  pointerEvents: "none",
  whiteSpace: "nowrap",
};

export const PRIMARY_VALUE_STYLE: React.CSSProperties = {
  color: "#ff0070",
};

export function getPrimaryValueStyle(
  kind: DrawingPresetKind,
): React.CSSProperties {
  return {
    ...PRIMARY_VALUE_STYLE,
    color: DRAWING_PRESET_COLORS[kind].main,
  };
}

export const deleteButtonStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 999,
  cursor: "pointer",
  marginTop: 10,
  padding: "6px 18px",
  width: "100%",
};
