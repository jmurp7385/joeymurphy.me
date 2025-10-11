export type WidgetType =
  | 'widgetPicker'
  | 'playback'
  | 'presets'
  | 'customization';

export function shouldShowWidget(
  widget: WidgetType,
  activeWidgets?: WidgetType[],
): boolean {
  if (!activeWidgets) return true; // If no active widget is set, show all widgets
  return activeWidgets.includes(widget);
}
