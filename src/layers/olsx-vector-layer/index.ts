import { defineOlsxVectorLayer } from "./factory/createVectorLayer";

const OLSXVectorLayer = defineOlsxVectorLayer();

export * from "./headless";
export * from "./draw";
export * from "./registry/featuresRegistry";
export * from "./types";
export {
  defineOlsxVectorLayer,
  defineOlsxVectorLayer as createVectorLayer,
  OLSXVectorLayer,
};
