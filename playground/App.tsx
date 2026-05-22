import { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import { useCallback, useMemo } from "react";
import {
  BaseLayer,
  Controls,
  createVectorLayer,
  OLSXMap,
  OLSXVectorLayer,
} from "../src";

const types = ["type1", "type2"] as const;

type SeoulPlace = {
  id: string;
  name: string;
  lon: number;
  lat: number;
};

const SeoulVectorLayer = createVectorLayer<typeof types, SeoulPlace>();

function App() {
  const seoulDummyData = useMemo<SeoulPlace[]>(
    () => [
      {
        id: "seoul-city-hall",
        name: "서울시청",
        lon: 126.9784,
        lat: 37.5666,
      },
      {
        id: "gwanghwamun",
        name: "광화문",
        lon: 126.9769,
        lat: 37.5759,
      },
      {
        id: "gangnam-station",
        name: "강남역",
        lon: 127.0276,
        lat: 37.4979,
      },
      {
        id: "hongdae",
        name: "홍대입구",
        lon: 126.9237,
        lat: 37.5563,
      },
      {
        id: "jamsil",
        name: "잠실",
        lon: 127.1002,
        lat: 37.5133,
      },
      {
        id: "yeouido",
        name: "여의도",
        lon: 126.9245,
        lat: 37.5219,
      },
    ],
    [],
  );

  const getId = useCallback((item: SeoulPlace) => item.id, []);

  const getGeometry = useCallback((item: SeoulPlace) => {
    return new Point(fromLonLat([item.lon, item.lat]));
  }, []);

  const markerStyle = useCallback((feature: FeatureLike, type?: string) => {
    const data = feature.get("_data") as SeoulPlace | undefined;

    return new Style({
      image: new CircleStyle({
        radius: type === "type1" ? 9 : 7,
        fill: new Fill({
          color: type === "type1" ? "#2563eb" : "#f97316",
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 3,
        }),
      }),
      text: new Text({
        text: data?.name ?? "",
        offsetY: -22,
        font: "600 13px sans-serif",
        fill: new Fill({
          color: "#111827",
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 4,
        }),
      }),
    });
  }, []);

  return (
    <OLSXMap style={{ width: "100dvw", height: "100dvh" }}>
      <BaseLayer />

      {/* <SeoulVectorLayer id="test-layer" types={types} style={markerStyle}>
        <SeoulVectorLayer.Source />

        <SeoulVectorLayer.FeatureSet
          type="type2"
          data={seoulDummyData}
          getId={getId}
          getGeometry={getGeometry}
        />
      </SeoulVectorLayer> */}
      <Controls>
        <Controls.ToggleBaseLayerButton />
        <Controls.ZoomButton />
      </Controls>
      <OLSXVectorLayer id="another-layer" types={types} style={markerStyle}>
        <OLSXVectorLayer.Source />
        <OLSXVectorLayer.FeatureSet
          type="type1"
          data={seoulDummyData}
          getId={getId}
          getGeometry={getGeometry}
          onClick={(item, feat) => {}}
        />
      </OLSXVectorLayer>
    </OLSXMap>
  );
}

export default App;
