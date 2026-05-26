/**
 * @ai-purpose Declarative component for OpenLayers Draw interaction linked to a vector source.
 * @ai-entry false
 * @ai-domain gis
 * @ai-depends Draw, mapRefsContext, vectorLayerContext
 * @ai-used-by OLSXVectorLayer.Draw compound component
 * @ai-keywords OLSXDraw, Draw, interaction, vectorSource
 */

import Draw from "ol/interaction/Draw";
import { Fill, Stroke } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMapRefsContext } from "../../../core/model/context";
import { useVectorLayerContext } from "../internal/vectorLayerContext";
import type { OLSXDrawProps, OLSXDrawRef } from "../types";

const DEFAULT_STYLE = new Style({
  fill: new Fill({ color: "rgba(59, 130, 246, 0.18)" }),
  stroke: new Stroke({
    color: "rgba(37, 99, 235, 0.85)",
    width: 3,
    lineDash: [6, 6],
  }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "rgba(37, 99, 235, 0.85)" }),
  }),
});

function OLSXDrawComp(
  { type = "LineString", style }: OLSXDrawProps,
  ref: React.ForwardedRef<OLSXDrawRef>,
) {
  const { mapRef } = useMapRefsContext();
  const { vectorSourceRef } = useVectorLayerContext();
  const drawRef = useRef<Draw | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    const vectorSource = vectorSourceRef.current;

    if (!map) return;

    if (!vectorSource) {
      console.warn("OLSXDraw requires vector source.");
      return;
    }

    const draw = new Draw({
      source: vectorSource,
      type,
      style: style ?? DEFAULT_STYLE,
    });
    map.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      map.removeInteraction(draw);
      drawRef.current = null;
    };
  }, [mapRef, vectorSourceRef, type, style]);

  useEffect(() => {
    if (!drawRef.current) return;
    console.log("drawref existing", drawRef.current);
  }, [drawRef]);

  useImperativeHandle(ref, () => ({ getDraw: () => drawRef.current }), []);

  return null;
}

export const OLSXDraw = forwardRef(OLSXDrawComp);
