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



export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  const normalizeHex = hex.replace(/^#/, '');

  // Convert hex to RGB
  const r = parseInt(normalizeHex.substring(0, 2), 16) / 255;
  const g = parseInt(normalizeHex.substring(2, 4), 16) / 255;
  const b = parseInt(normalizeHex.substring(4, 6), 16) / 255;

  // Find min and max values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}
