import { BaseLayerToggle } from "./BaseLayerToggle";
import { ZoomControl } from "./ZoomControl";
import { DrawingToolbar } from "./DrawingToolbar";

type ControlsProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

function ControlsRoot({ className, style, children }: ControlsProps) {
  const combinedClassName = `olsx-controls ${className ?? ""}`.trim();
  return (
    <div className={combinedClassName} style={style}>
      {children}
    </div>
  );
}

type Controls = typeof ControlsRoot & {
  Zoom: typeof ZoomControl;
  BaseLayerToggle: typeof BaseLayerToggle;
  DrawingToolbar: typeof DrawingToolbar;
  ZoomButton: typeof ZoomControl;
  ToggleBaseLayerButton: typeof BaseLayerToggle;
};

const Controls = ControlsRoot as Controls;
Controls.Zoom = ZoomControl;
Controls.BaseLayerToggle = BaseLayerToggle;
Controls.DrawingToolbar = DrawingToolbar;
Controls.ZoomButton = ZoomControl;
Controls.ToggleBaseLayerButton = BaseLayerToggle;

export { Controls };
