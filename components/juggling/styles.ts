import React from 'react';

export type StyleKeys =
  | 'container'
  | 'canvas'
  | 'error'
  | 'widgetContainer'
  | 'siteswapWidget'
  | 'input'
  | 'button'
  | 'flexCenter';

export const getStyles = (
  width: number,
): Record<StyleKeys, React.CSSProperties> => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    color: '#e0e0e0',
    width: '100%',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
  },
  canvas: {
    backgroundColor: '#222',
    borderRadius: '8px',
    border: '1px solid #444',
  },
  error: {
    color: '#ff4d4d',
    marginTop: '10px',
    height: '20px',
    fontWeight: 'bold',
  },
  widgetContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: width,
    justifyContent: 'center',
  },
  siteswapWidget: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#2a2a2a',
    flexWrap: 'wrap',
    flexDirection: 'row',
    borderRadius: '8px',
    width: '100%',
    justifyContent: 'center',
    maxWidth: width,
  },
  input: {
    backgroundColor: '#333',
    border: '1px solid #444',
    color: '#e0e0e0',
    borderRadius: '4px',
    padding: '8px',
    width: '80px',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007acc',
    border: 'none',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  flexCenter: { display: 'flex', alignItems: 'center', gap: '10px' },
});
