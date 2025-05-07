import { ReactNode } from 'react';
import styles from '../../styles/Widget.module.css';
import { shouldShowWidget, WidgetType } from '../../utilities';

interface WidgetProps {
  widget: WidgetType;
  activeWidget?: WidgetType[];
  children: ReactNode;
  backgroundColor?: string;
}
export function Widget(props: WidgetProps) {
  const { widget, activeWidget, children, backgroundColor } = props;

  return shouldShowWidget(widget, activeWidget) ? (
    <div
      className={[styles.controlContainer, styles[widget]].join(' ')}
      style={{ background: backgroundColor }}
    >
      {children}
    </div>
  ) : null;
}
