import assert from "node:assert/strict";
import test from "node:test";
import {
  DRAWING_PRESET_COLORS,
  getDrawingPresetCursor,
} from "./drawingPresetStyles";

test("drawing preset colors are distinct per measurement mode", () => {
  assert.notEqual(
    DRAWING_PRESET_COLORS.distance.main,
    DRAWING_PRESET_COLORS.area.main,
  );
  assert.notEqual(
    DRAWING_PRESET_COLORS.area.main,
    DRAWING_PRESET_COLORS.circle.main,
  );
  assert.notEqual(
    DRAWING_PRESET_COLORS.distance.main,
    DRAWING_PRESET_COLORS.circle.main,
  );
});

test("drawing preset cursor contains an inline svg cursor and crosshair fallback", () => {
  assert.match(getDrawingPresetCursor("distance"), /^url\("data:image\/svg\+xml,/);
  assert.match(getDrawingPresetCursor("area"), /crosshair$/);
  assert.match(getDrawingPresetCursor("circle"), /%23/);
});
