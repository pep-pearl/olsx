import type { CSSProperties } from "react";

export const controlsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  right: 10,
  top: 10,
  gap: 8,
};

export const controlGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  padding: 0,
  margin: 0,
  border: "1px solid #e5e7eb",
  boxSizing: "border-box",
  borderRadius: 4,
  backgroundColor: "#ffffffcc",
};

export const controlButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  border: "none",
  cursor: "pointer",
  padding: 8,
  boxSizing: "border-box",
  color: "#111827",
  backgroundColor: "transparent",
};

export const standaloneControlButtonStyle: CSSProperties = {
  ...controlButtonStyle,
  borderRadius: 4,
  backgroundColor: "#ffffffcc",
  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
};
