import { OLSXMap as Map } from "./components/OLSXMap";
import { OLSXView } from "./components/OLSXView";

type OLSXMapCompound = typeof Map & {
  View: typeof OLSXView;
};

const OLSXMap = Map as OLSXMapCompound;
OLSXMap.View = OLSXView;

export * from "./types";
export { OLSXMap };
