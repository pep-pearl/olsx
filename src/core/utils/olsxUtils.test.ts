import assert from "node:assert/strict";
import test from "node:test";
import { buildDrawListenerKey, buildListenerKey } from "./olsxUtils";

test("buildListenerKey creates stable feature event keys", () => {
  assert.equal(buildListenerKey("layer", "features", "singleclick"), "layer:features:singleclick");
});

test("buildDrawListenerKey creates stable draw event keys", () => {
  assert.equal(buildDrawListenerKey("measure", "drawstart"), "draw:measure:drawstart");
});
