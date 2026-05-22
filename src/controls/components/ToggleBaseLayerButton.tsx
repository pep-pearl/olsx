import { useBaseLayerContext, useMapReadyContext } from "../../core/model/context";
import { useToggleBaseLayer } from "../hooks/useToggleBaseLayer";

type ToggleBaseLayerButtonProps = {
  className?: string;
  style?: React.CSSProperties;
};

type ToggleBaseLayerButtonPropsWithChildren = {
  children: React.ReactNode | ((toggle: () => void) => React.ReactNode);
};

type Props = ToggleBaseLayerButtonProps &
  Partial<ToggleBaseLayerButtonPropsWithChildren>;

export function ToggleBaseLayerButton({ className, style, children }: Props) {
  const { isMapReady } = useMapReadyContext();
  const { baseLayerType } = useBaseLayerContext();
  const { toggle } = useToggleBaseLayer();

  if (!isMapReady) return null;

  if (!children) {
    return (
      <button
        className={className ?? ""}
        aria-label="Toggle Base Layer"
        style={
          style ?? {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 4,
            backgroundColor: "#ffffffcc",
            border: "none",
            cursor: "pointer",
            padding: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            boxSizing: "border-box",
            color: "#111827",
          }
        }
        onClick={toggle}
      >
        {baseLayerType === "street" ? (
          <span aria-label="Switch to Satellite">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#1f1f1f"
              style={{ width: "100%", height: "100%" }}
            >
              <path d="m574-129-214-75-186 72q-10 4-19.5 2.5T137-136q-8-5-12.5-13.5T120-169v-561q0-13 7.5-23t20.5-15l186-63q6-2 12.5-3t13.5-1q7 0 13.5 1t12.5 3l214 75 186-72q10-4 19.5-2.5T823-824q8 5 12.5 13.5T840-791v561q0 13-7.5 23T812-192l-186 63q-6 2-12.5 3t-13.5 1q-7 0-13.5-1t-12.5-3Zm-14-89v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z" />
            </svg>
          </span>
        ) : baseLayerType === "satellite" ? (
          <span aria-label="Switch to Street">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              style={{ width: "100%", height: "100%" }}
            >
              <path d="M561-32q-17 0-29-11.5T520-72q0-17 11.5-28.5T560-112q117 0 198.5-81.5T840-392q0-17 11.5-28.5T880-432q17 0 28.5 11.5T920-392q0 74-28.5 139.5t-77 114.5q-48.5 49-114 77.5T561-32Zm0-160q-17 0-29-11.5T520-232q0-17 11.5-28.5T560-272q50 0 85-35t35-85q0-17 11.5-28.5T720-432q17 0 28.5 11.5T760-392q-1 83-58.5 141T561-192ZM222-57q-15 0-30-6t-27-17L23-222q-11-12-17-27t-6-30q0-16 6-30.5T23-335l127-127q23-23 57-23.5t57 22.5l50 50 28-28-50-50q-23-23-23-56t23-56l57-57q23-23 56.5-23t56.5 23l50 50 28-28-50-50q-23-23-23-56.5t23-56.5l127-127q12-12 27-18t30-6q15 0 29.5 6t26.5 18l142 142q12 11 17.5 25.5T895-730q0 15-5.5 30T872-673L745-546q-23 23-56.5 23T632-546l-50-50-28 28 50 50q23 23 22.5 56.5T603-405l-56 56q-23 23-56.5 23T434-349l-50-50-28 28 50 50q23 23 22.5 57T405-207L278-80q-11 11-25.5 17T222-57Zm0-79 42-42-142-142-42 42 142 142Zm85-85 42-42-142-142-42 42 142 142Zm184-184 56-56-142-142-56 56 142 142Zm198-198 42-42-142-142-42 42 142 142Zm85-85 42-42-142-142-42 42 142 142ZM448-504Z" />
            </svg>
          </span>
        ) : null}
      </button>
    );
  }

  return typeof children === "function" ? children(toggle) : children;
}
