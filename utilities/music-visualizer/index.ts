export function shouldShowWidget<T extends string>(
  widget: T,
  activeWidgets?: T[],
): boolean {
  if (!activeWidgets) return true; // If no active widget is set, show all widgets
  return activeWidgets.includes(widget);
}
