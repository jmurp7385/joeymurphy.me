import { CSSProperties, ReactNode } from 'react';
import styles from '../../styles/Widget.module.css';
import { shouldShowWidget } from './utilities';

interface WidgetProperties<T extends string> {
  widget: T;
  activeWidget?: T[];
  children: ReactNode;
  backgroundColor?: string;
  style?: CSSProperties;
}
export function Widget<T extends string>(properties: WidgetProperties<T>) {
  const { widget, activeWidget, children, backgroundColor, style } = properties;

  return shouldShowWidget<T>(widget, activeWidget) ? (
    <div
      className={[styles.controlContainer, styles[widget]].join(' ')}
      style={{ background: backgroundColor, ...style }}
    >
      {children}
    </div>
  ) : undefined;
}
