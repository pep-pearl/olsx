import type { DrawingKind } from "../types";

export type DrawingCommand = "cancel" | "undo" | "redo" | "clear";

export type DrawingCommandState = {
  canUndo: boolean;
  canRedo: boolean;
};

export type DrawingCommandRegistration = DrawingCommandState & {
  kind: DrawingKind;
  cancel: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

const registrations = new Map<string, DrawingCommandRegistration>();
const listeners = new Set<() => void>();
let currentState: DrawingCommandState = { canUndo: false, canRedo: false };

function computeAggregatedState(): DrawingCommandState {
  let canUndo = false;
  let canRedo = false;

  registrations.forEach((registration) => {
    canUndo ||= registration.canUndo;
    canRedo ||= registration.canRedo;
  });

  return { canUndo, canRedo };
}

function notifyListeners() {
  currentState = computeAggregatedState();
  listeners.forEach((listener) => listener());
}

export function getDrawingCommandState() {
  return currentState;
}

export function registerDrawingCommands(
  id: string,
  registration: DrawingCommandRegistration,
) {
  registrations.set(id, registration);
  notifyListeners();

  return () => {
    registrations.delete(id);
    notifyListeners();
  };
}

export function updateDrawingCommandState(
  id: string,
  state: DrawingCommandState,
) {
  const registration = registrations.get(id);
  if (!registration) return;

  registrations.set(id, {
    ...registration,
    ...state,
  });
  notifyListeners();
}

export function subscribeDrawingCommandState(
  listener: () => void,
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function findCommandRegistration(
  command: "undo" | "redo",
  preferredKind?: DrawingKind | null,
) {
  const activeRegistrations = Array.from(registrations.values());
  const canRun = command === "undo" ? "canUndo" : "canRedo";
  const preferredRegistration = activeRegistrations.findLast(
    (registration) =>
      registration.kind === preferredKind && registration[canRun],
  );

  return (
    preferredRegistration ??
    activeRegistrations.findLast((registration) => registration[canRun])
  );
}

export function runDrawingCommand(
  command: DrawingCommand,
  preferredKind?: DrawingKind | null,
) {
  const activeRegistrations = Array.from(registrations.values());

  if (command === "undo") {
    findCommandRegistration(command, preferredKind)?.undo();
    return;
  }

  if (command === "redo") {
    findCommandRegistration(command, preferredKind)?.redo();
    return;
  }

  if (command === "cancel" && preferredKind) {
    activeRegistrations
      .filter((registration) => registration.kind === preferredKind)
      .forEach((registration) => {
        registration.cancel();
      });
    return;
  }

  activeRegistrations.forEach((registration) => {
    registration[command]();
  });
}
