import { ToggleBaseLayerButton } from "./ToggleBaseLayerButton";
import { ZoomButton } from "./ZoomButton";

type ControlsProps = {
  children?: React.ReactNode;
};

export function ControlsWrap({ children }: ControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        right: 10,
        top: 10,
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

type Controls = typeof ControlsWrap & {
  ZoomButton: typeof ZoomButton;
  ToggleBaseLayerButton: typeof ToggleBaseLayerButton;
};

const Controls = ControlsWrap as Controls;
Controls.ZoomButton = ZoomButton;
Controls.ToggleBaseLayerButton = ToggleBaseLayerButton;

export { Controls, ToggleBaseLayerButton, ZoomButton };
