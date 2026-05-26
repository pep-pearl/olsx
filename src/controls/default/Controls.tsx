import { BaseLayerToggle } from "./BaseLayerToggle";
import { controlsStyle } from "./styles";
import { ZoomControl } from "./ZoomControl";

type ControlsProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

function ControlsRoot({ className, style, children }: ControlsProps) {
  return (
    <div className={className} style={style ?? controlsStyle}>
      {children}
    </div>
  );
}

type Controls = typeof ControlsRoot & {
  Zoom: typeof ZoomControl;
  BaseLayerToggle: typeof BaseLayerToggle;
  ZoomButton: typeof ZoomControl;
  ToggleBaseLayerButton: typeof BaseLayerToggle;
};

const Controls = ControlsRoot as Controls;
Controls.Zoom = ZoomControl;
Controls.BaseLayerToggle = BaseLayerToggle;
Controls.ZoomButton = ZoomControl;
Controls.ToggleBaseLayerButton = BaseLayerToggle;

export { Controls };
