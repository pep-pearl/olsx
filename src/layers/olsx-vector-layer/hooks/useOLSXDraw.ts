import type { Coordinate } from "ol/coordinate";
import type VectorSource from "ol/source/Vector";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVectorLayerContext } from "../internal/vectorLayerContext";

/**
 * drawing 컴포넌트들에서 공통으로 사용되는 상태 및 ref 관리용 공용 훅들
 */

export function useOLSXDrawLatestSourceRef() {
  const { vectorSourceRef } = useVectorLayerContext();
  const latestSourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    latestSourceRef.current = vectorSourceRef.current;
  });

  return { latestSourceRef, vectorSourceRef };
}

export function useOLSXDrawPreviewCoordinate() {
  const previewCoordinateRef = useRef<Coordinate | null>(null);
  const [previewCoordinate, setPreviewCoordinate] = useState<Coordinate | null>(
    null,
  );

  const setNextPreviewCoordinate = useCallback(
    (coordinate: Coordinate | null) => {
      previewCoordinateRef.current = coordinate;
      setPreviewCoordinate(coordinate);
    },
    [],
  );

  return {
    previewCoordinate,
    previewCoordinateRef,
    setNextPreviewCoordinate,
  };
}

export function useOLSXDrawPoints() {
  const pointsRef = useRef<Coordinate[]>([]);
  const [points, setPoints] = useState<Coordinate[]>([]);

  const setNextPoints = useCallback((nextPoints: Coordinate[]) => {
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
  }, []);

  return {
    pointsRef,
    points,
    setNextPoints,
  };
}
