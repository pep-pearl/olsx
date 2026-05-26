import Feature from "ol/Feature";
import { createFeaturesRegistry } from "./featuresRegistry";

const registry = createFeaturesRegistry();

const feature = new Feature();
const otherFeature = new Feature();

registry.set("single-feature", feature);
registry.set("feature-group", [feature, otherFeature]);

const singleEntry = registry.get("single-feature");
const groupEntry = registry.get("feature-group");

if (!singleEntry || singleEntry.kind !== "feature") {
  throw new Error("Expected single feature registry entry");
}

if (!groupEntry || groupEntry.kind !== "features") {
  throw new Error("Expected feature group registry entry");
}

registry.delete("single-feature");
registry.clear();
