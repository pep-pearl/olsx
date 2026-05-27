import { OLSXVectorLayer } from "../index";
import { useDrawingHistory, type DrawingResult } from "../headless";

const distanceElement = (
  <OLSXVectorLayer.Draw.Distance
    active
    onComplete={() => undefined}
    onDelete={() => undefined}
  />
);

const areaElement = (
  <OLSXVectorLayer.Draw.Area
    active
    onComplete={() => undefined}
    onDelete={() => undefined}
  />
);

const circleElement = (
  <OLSXVectorLayer.Draw.Circle
    active
    onComplete={() => undefined}
    onDelete={() => undefined}
  />
);

function useDrawingHistoryTypeCheck() {
  const history = useDrawingHistory();
  const result: DrawingResult = {
    id: "distance-1",
    kind: "distance",
    feature: {},
    value: 10,
    label: "10 m",
    coordinate: [0, 0],
    createdAt: 1,
  };

  history.complete(result);
  history.deleteResult(result.id);
  history.undo();
  history.redo();
  history.clear();

  return (
    <div
      data-results={history.results.length}
      data-can-undo={history.canUndo}
      data-can-redo={history.canRedo}
    />
  );
}

void useDrawingHistoryTypeCheck;
void distanceElement;
void areaElement;
void circleElement;
